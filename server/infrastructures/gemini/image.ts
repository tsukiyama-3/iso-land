// import { GoogleGenAI } from '@google/genai'
// import { Buffer } from 'node:buffer'

export const generateImage = async (body: { prompt: string, latLng: google.maps.MapMouseEvent['latLng'] }) => {
  const config = useRuntimeConfig()
  // const ai = new GoogleGenAI({
  //   apiKey: config.gemini.apiKey,
  // })

  // const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${body.latLng?.lat},${body.latLng?.lng}&zoom=16&size=600x600&markers=color:red%7C${body.latLng?.lat},${body.latLng?.lng}&key=${config.public.google.apiKey}`
  // const arrayBuffer = await $fetch<ArrayBuffer>(staticMapUrl, { responseType: 'arrayBuffer' })
  // const buffer = Buffer.from(arrayBuffer)
  // const base64 = buffer.toString('base64')

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.openRouter.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-image-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${config.basePrompt.replace(/\\n/g, '\n')}${body.prompt}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `https://maps.googleapis.com/maps/api/staticmap?center=${body.latLng?.lat},${body.latLng?.lng}&zoom=16&size=600x600&markers=color:red%7C${body.latLng?.lat},${body.latLng?.lng}&key=${config.public.google.apiKey}`,
              },
            },
          ],
        },
      ],
    }),
  })

  console.log(response, 'response')

  // const response = await ai.models.generateContent({
  //   model: 'gemini-2.5-flash-image-preview',
  //   contents: [
  //     {
  //       role: 'user',
  //       parts: [
  //         { text: `${config.basePrompt.replace(/\\n/g, '\n')}${body.prompt}` },
  //         {
  //           inlineData: {
  //             mimeType: 'image/png',
  //             data: base64,
  //           },
  //         },
  //       ],
  //     },
  //   ],
  // })

  const result = await response.json()

  const safeResult = JSON.parse(JSON.stringify(result, (key, value) => {
    if (typeof value === 'string' && value.startsWith('data:image')) {
      return value.slice(0, 50) + '...<omitted>'
    }
    return value
  }, 2))

  console.log('--- OpenRouter response ---')
  console.dir(safeResult, { depth: null })

  const message = result.choices?.[0]?.message

  if (Array.isArray(message?.images)) {
    const imagePart = message.images.find((img: any) => img.type === 'image_url')
    const base64Url = imagePart?.image_url?.url
    if (base64Url?.startsWith('data:image')) {
      const [meta, base64Data] = base64Url.split(',')
      return {
        role: 'assistant',
        type: 'image',
        mimeType: meta.replace('data:', '').replace(';base64', ''),
        data: base64Data, // ← Base64データだけ切り出し
        content: '',
      }
    }
  }

  if (typeof message?.content === 'string' && message.content.length > 0) {
    return {
      role: 'assistant',
      type: 'text',
      content: message.content,
      mimeType: 'text/plain',
      data: '',
    }
  }

  return {
    role: 'assistant',
    type: 'text',
    content: '画像生成に失敗しました、もう一度お試しください。',
    mimeType: 'text/plain',
    data: '',
  }
}
