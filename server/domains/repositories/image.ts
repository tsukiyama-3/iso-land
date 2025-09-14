import { generateImage as generateGeminiImage } from '~~/server/infrastructures/gemini/image'
import { put } from '@vercel/blob'
import { kv } from '@vercel/kv'

export const generateImage = async (body: { prompt: string, latLng: google.maps.MapMouseEvent['latLng'] }) => {
  const response = await generateGeminiImage(body)

  // 画像が生成された場合、Vercel Blob StorageとKVに保存
  if (response.type === 'image' && response.data) {
    try {
      // Base64データをBufferに変換
      const buffer = Buffer.from(response.data, 'base64')

      // ユニークなIDを生成
      const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Vercel Blob Storageに画像を保存
      const { url } = await put(`images/${id}.png`, buffer, {
        contentType: 'image/png',
        access: 'public',
      })

      // Vercel KVにメタデータを保存
      await kv.set(`image:${id}`, {
        url,
        prompt: body.prompt,
        lat: body.latLng?.lat,
        lng: body.latLng?.lng,
        createdAt: new Date().toISOString(),
        likes: 0,
      })

      // レスポンスに保存されたURLとIDを追加
      return {
        ...response,
        savedUrl: url,
        savedId: id,
      }
    }
    catch (error) {
      console.error('画像保存エラー:', error)
      // 保存に失敗しても画像生成の結果は返す
      return response
    }
  }

  return response
}
