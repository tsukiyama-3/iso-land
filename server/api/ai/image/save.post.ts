import { saveImage } from '~~/server/domains/repositories/image'

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
    
    return {
      success: true,
      ...result,
    }
  }
  catch (error: any) {
    console.error('画像保存エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '画像の保存に失敗しました',
    })
  }
})
