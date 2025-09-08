// import type { H3Event } from 'h3'
import { generateImage } from '~~/server/domains/repositories/image'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ prompt: string }>(event)
  const result = await generateImage(body)
  return result
})
