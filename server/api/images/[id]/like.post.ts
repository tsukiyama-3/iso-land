import { kv } from '@vercel/kv'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: '画像IDが必要です',
      })
    }

    // レート制限チェック（1時間5回まで）
    const clientIP = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
    const currentHour = new Date().toISOString().slice(0, 13) // YYYY-MM-DDTHH形式
    const rateLimitKey = `like_limit:${clientIP}:${currentHour}`

    const currentCount = (await kv.get(rateLimitKey) as number) || 0

    if (currentCount >= 5) {
      throw createError({
        statusCode: 429,
        statusMessage: '1時間のいいね回数制限（5回）に達しました。時間をおいてから再度お試しください。',
      })
    }

    // 画像のメタデータを取得
    const imageData = await kv.get(`image:${id}`) as Record<string, unknown> | null

    if (!imageData) {
      throw createError({
        statusCode: 404,
        statusMessage: '画像が見つかりません',
      })
    }

    // いいね数をインクリメント
    const updatedData = {
      ...imageData,
      likes: ((imageData.likes as number) || 0) + 1,
    }

    // 更新されたデータを保存
    await kv.set(`image:${id}`, updatedData)

    // いいね成功時にカウントを増加（1時間で期限切れ）
    await kv.setex(rateLimitKey, 300, currentCount + 1)

    // いいね数が更新されたので、ギャラリーのキャッシュを無効化
    try {
      const keys = await kv.keys('images_list_page_*')
      if (keys.length > 0) {
        await kv.del(...keys)
      }
    }
    catch (cacheError) {
      // キャッシュクリアのエラーはいいね処理の成功に影響しないため、ログのみ出力
      console.warn('キャッシュクリアエラー:', cacheError)
    }

    return {
      success: true,
      likes: updatedData.likes,
    }
  }
  catch (error: unknown) {
    // レート制限エラーはそのまま投げる
    const errorRecord = error as Record<string, unknown>
    if (errorRecord?.statusCode === 429 || errorRecord?.statusCode === 400 || errorRecord?.statusCode === 404) {
      throw error
    }

    console.error('いいねエラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'いいねの処理に失敗しました',
    })
  }
})
