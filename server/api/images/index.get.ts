import { kv } from '@vercel/kv'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 30

    // KVから全ての画像メタデータを取得
    const keys = await kv.keys('image:*')

    if (keys.length === 0) {
      return {
        images: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      }
    }

    const allImages = []

    for (const key of keys) {
      const imageData = await kv.get(key)
      if (imageData) {
        allImages.push({
          id: key.replace('image:', ''),
          ...imageData,
        })
      }
    }

    // 作成日時で降順ソート
    allImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // ページネーション処理
    const total = allImages.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const images = allImages.slice(startIndex, endIndex)

    return {
      images,
      total,
      page,
      limit,
      totalPages,
    }
  }
  catch (error) {
    console.error('画像一覧取得エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '画像一覧の取得に失敗しました',
    })
  }
})
