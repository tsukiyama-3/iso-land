import { generateImage as generateGeminiImage } from '~~/server/infrastructures/gemini/image'

export const generateImage = async (body: { prompt: string, latLng: google.maps.MapMouseEvent['latLng'] }) => {
  const response = await generateGeminiImage(body)
  return response
}
