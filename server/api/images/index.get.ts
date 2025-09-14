import { kv } from '@vercel/kv'

export default defineEventHandler(async (event) => {
  try {
    // KVから全ての画像メタデータを取得
    const keys = await kv.keys('image:*')
    const images = []
    
    for (const key of keys) {
      const imageData = await kv.get(key)
      if (imageData) {
        images.push({
          id: key.replace('image:', ''),
          ...imageData,
        })
      }
    }
    
    // 作成日時で降順ソート
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return images
  } catch (error) {
    console.error('画像一覧取得エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '画像一覧の取得に失敗しました',
    })
  }
})
