import { generateImage as generateGeminiImage } from '../../infrastructures/gemini/image'

export const generateImage = async () => {
  const response = await generateGeminiImage()
  return response
}
