import { GoogleGenAI } from '@google/genai'

export const generateImage = async (body: { prompt: string }) => {
  const config = useRuntimeConfig()
  const ai = new GoogleGenAI({
    apiKey: config.gemini.apiKey,
  })

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: [
      {
        role: 'user',
        parts: [{ text: body.prompt }],
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
