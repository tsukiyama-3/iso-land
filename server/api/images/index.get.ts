import { kv } from '@vercel/kv'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 30

    // キャッシュキーを生成（ページ単位でキャッシュ）
    const cacheKey = `images_list_page_${page}_limit_${limit}`

    // まずキャッシュから取得を試行（5分間キャッシュ）
    const cachedResult = await kv.get(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    // KVから全ての画像キーを取得
    const keys = await kv.keys('image:*')

    if (keys.length === 0) {
      const emptyResult = {
        images: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      }
      // 空の結果も短時間キャッシュ
      await kv.setex(cacheKey, 60, emptyResult)
      return emptyResult
    }

    // バッチでデータを取得（mget使用で一度のリクエストで複数取得）
    const imageDataList = await kv.mget(...keys)

    // 有効なデータのみをフィルタリングして配列を構築
    interface ImageItem {
      id: string
      createdAt: string
      [key: string]: unknown
    }

    const allImages: ImageItem[] = []
    for (let i = 0; i < keys.length; i++) {
      const imageData = imageDataList[i]
      if (imageData && typeof imageData === 'object' && 'createdAt' in imageData) {
        const typedImageData = imageData as Record<string, unknown> & { createdAt: string }
        allImages.push({
          id: keys[i].replace('image:', ''),
          ...typedImageData,
        })
      }
    }

    // 作成日時で降順ソート（より効率的な比較）
    allImages.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime()
      const bTime = new Date(b.createdAt).getTime()
      return bTime - aTime
    })

    // ページネーション処理
    const total = allImages.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const images = allImages.slice(startIndex, endIndex)

    const result = {
      images,
      total,
      page,
      limit,
      totalPages,
    }

    // 結果をキャッシュ（5分間）
    await kv.setex(cacheKey, 300, result)

    return result
  }
  catch (error) {
    console.error('画像一覧取得エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '画像一覧の取得に失敗しました',
    })
  }
})
