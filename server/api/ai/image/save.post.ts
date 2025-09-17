import { saveImage } from '~~/server/domains/repositories/image'
import { kv } from '@vercel/kv'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{
      data: string
      tempId: string
      prompt: string
      latLng?: google.maps.MapMouseEvent['latLng']
    }>(event)

    // 必要なデータが揃っているかチェック
    if (!body.data || !body.tempId || !body.prompt) {
      throw createError({
        statusCode: 400,
        statusMessage: '必要なデータが不足しています',
      })
    }

    const result = await saveImage(body)

    // 新しい画像が保存されたので、ギャラリーのキャッシュを無効化
    try {
      const keys = await kv.keys('images_list_page_*')
      if (keys.length > 0) {
        await kv.del(...keys)
      }
    }
    catch (cacheError) {
      // キャッシュクリアのエラーは画像保存の成功に影響しないため、ログのみ出力
      console.warn('キャッシュクリアエラー:', cacheError)
    }

    return {
      success: true,
      ...result,
    }
  }
  catch (error: unknown) {
    console.error('画像保存エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '画像の保存に失敗しました',
    })
  }
})
