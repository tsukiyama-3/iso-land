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

    // 画像のメタデータを取得
    const imageData = await kv.get(`image:${id}`)

    if (!imageData) {
      throw createError({
        statusCode: 404,
        statusMessage: '画像が見つかりません',
      })
    }

    // いいね数をインクリメント
    const updatedData = {
      ...imageData,
      likes: (imageData.likes || 0) + 1,
    }

    // 更新されたデータを保存
    await kv.set(`image:${id}`, updatedData)

    return {
      success: true,
      likes: updatedData.likes,
    }
  }
  catch (error) {
    console.error('いいねエラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'いいねの処理に失敗しました',
    })
  }
})
