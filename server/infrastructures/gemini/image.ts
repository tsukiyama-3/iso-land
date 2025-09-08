import { GoogleGenAI } from '@google/genai'

export const generateImage = async () => {
  const config = useRuntimeConfig()
  const ai = new GoogleGenAI({
    apiKey: config.gemini.apiKey,
  })
  const prompt = config.basePrompt

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: prompt,
  })

  // 画像 or テキストを取り出す
  const parts = response.candidates?.[0]?.content?.parts || []

  const imagePart = parts.find(p => p.inlineData)
  if (imagePart?.inlineData) {
    return {
      type: 'image',
      mimeType: imagePart.inlineData.mimeType,
      data: imagePart.inlineData.data,
    }
  }
}
