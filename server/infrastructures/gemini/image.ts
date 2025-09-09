import { GoogleGenAI } from '@google/genai'
import { Buffer } from 'node:buffer'

export const generateImage = async (body: { prompt: string, latLng: google.maps.MapMouseEvent['latLng'] }) => {
  const config = useRuntimeConfig()
  const ai = new GoogleGenAI({
    apiKey: config.gemini.apiKey,
  })

  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${body.latLng?.lat},${body.latLng?.lng}&zoom=16&size=600x600&markers=color:red%7C${body.latLng?.lat},${body.latLng?.lng}&key=${config.public.google.apiKey}`
  const arrayBuffer = await $fetch<ArrayBuffer>(staticMapUrl, { responseType: 'arrayBuffer' })
  const buffer = Buffer.from(arrayBuffer)
  const base64 = buffer.toString('base64')
  console.log(staticMapUrl, config.basePrompt, 'staticMapUrl')

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

  const imagePart = response.candidates
    ?.flatMap(c => c.content?.parts ?? [])
    .find(p => p.inlineData)

  console.log(response.candidates, imagePart, 'response.candidates imagePart')
  if (imagePart?.inlineData) {
    return {
      type: 'image',
      mimeType: imagePart.inlineData.mimeType,
      data: imagePart.inlineData.data,
      content: '',
    }
  }

  return {
    type: 'text',
    content: '画像を生成できませんでした。',
    mimeType: '',
    data: '',
  }
}
