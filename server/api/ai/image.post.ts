// import type { H3Event } from 'h3'
import { generateImage } from '~~/server/domains/repositories/image'

export default defineCachedEventHandler(async () => {
  const result = await generateImage()
  return result
})
