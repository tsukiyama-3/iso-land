import { GoogleGenAI } from '@google/genai'
import { Buffer } from 'node:buffer'

export const generateImage = async (body: { prompt: string }) => {
  const config = useRuntimeConfig()
  const ai = new GoogleGenAI({
    apiKey: config.gemini.apiKey,
  })

  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=35.63078175096637,139.88115107459188&zoom=16&size=600x600&key=${config.public.google.apiKey}`
  const arrayBuffer = await $fetch<ArrayBuffer>(staticMapUrl, { responseType: 'arrayBuffer' })
  const buffer = Buffer.from(arrayBuffer)
  const base64 = buffer.toString('base64')

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${config.basePrompt}${body.prompt}` },
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64,
            },
          },
        ],
      },
    ],
  })

  const parts = response.candidates?.[0]?.content?.parts || []

  // 画像があれば返す
  const imagePart = parts.find(p => p.inlineData)
  if (imagePart?.inlineData) {
    return {
      type: 'image',
      mimeType: imagePart.inlineData.mimeType,
      data: imagePart.inlineData.data,
    }
  }

  // テキストがあれば返す
  const textPart = parts.find(p => p.text)
  if (textPart?.text) {
    return {
      type: 'text',
      content: textPart.text,
    }
  }

  // どちらも無ければ fallback
  return {
    type: 'text',
    content: '画像を生成できませんでした。',
  }
}
