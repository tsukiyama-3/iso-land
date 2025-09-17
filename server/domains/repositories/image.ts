import { generateImage as generateGeminiImage } from '~~/server/infrastructures/gemini/image'
import { put } from '@vercel/blob'
import { kv } from '@vercel/kv'

// 画像生成のみを行う関数（保存は別途実行）
export const generateImage = async (body: { prompt: string, latLng: google.maps.MapMouseEvent['latLng'] }) => {
  const response = await generateGeminiImage(body)

  // 生成された画像データにIDを付与して即座に返す
  if (response.type === 'image' && response.data) {
    const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      ...response,
      tempId: id,
      prompt: body.prompt,
      latLng: body.latLng,
    }
  }

  return response
}

// 画像保存を行う関数（非同期で実行）
export const saveImage = async (imageData: {
  data: string
  tempId: string
  prompt: string
  latLng?: google.maps.MapMouseEvent['latLng']
}) => {
  try {
    // Base64データをBufferに変換
    const buffer = Buffer.from(imageData.data, 'base64')

    // Vercel Blob Storageに画像を保存
    const { url } = await put(`images/${imageData.tempId}.png`, buffer, {
      contentType: 'image/png',
      access: 'public',
    })

    // Vercel KVにメタデータを保存
    await kv.set(`image:${imageData.tempId}`, {
      url,
      prompt: imageData.prompt,
      lat: imageData.latLng?.lat,
      lng: imageData.latLng?.lng,
      createdAt: new Date().toISOString(),
      likes: 0,
    })

    return {
      savedUrl: url,
      savedId: imageData.tempId,
    }
  }
  catch (error) {
    console.error('画像保存エラー:', error)
    throw error
  }
}
