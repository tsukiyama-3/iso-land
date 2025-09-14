export const generateImage = async (body: { prompt: string, latLng: google.maps.MapMouseEvent['latLng'] }) => {
  const config = useRuntimeConfig()

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

  const result = await response.json()
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

  return {
    role: 'assistant',
    type: 'text',
    content: '画像生成に失敗しました、もう一度お試しください。',
    mimeType: 'text/plain',
    data: '',
  }
}
