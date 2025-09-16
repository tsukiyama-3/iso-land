// import type { H3Event } from 'h3'
import { generateImage } from '~~/server/domains/repositories/image'
import { kv } from '@vercel/kv'

export default defineEventHandler(async (event) => {
  // モックモードの場合はモックデータを返す
  // if (true) {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve({
  //         content: 'モック画像が生成されました',
  //         mimeType: 'image/png',
  //         type: 'image',
  //         data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  //         savedUrl: 'https://picsum.photos/512/512?random=' + Date.now(),
  //         savedId: 'mock_' + Date.now(),
  //       })
  //     }, 2000)
  //   })
  // }

  const config = useRuntimeConfig()

  // レート制限チェック（一日5回まで）
  const clientIP = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD形式
  const rateLimitKey = `daily_limit:${clientIP}:${today}`

  try {
    const currentCount = (await kv.get(rateLimitKey) as number) || 0

    if (config.generateLimit && String(config.generateLimit).trim() !== '' && currentCount >= Number(config.generateLimit)) {
      throw createError({
        statusCode: 429,
        statusMessage: `1日の使用回数制限（${config.generateLimit}回）に達しました。時間をおいてから再度お試しください。`,
      })
    }
    const body = await readBody<{ prompt: string, latLng: google.maps.MapMouseEvent['latLng'] }>(event)

    // プロンプトの基本検証
    if (!body.prompt || body.prompt.trim().length < 3 || body.prompt.trim().length > 200) {
      throw createError({
        statusCode: 400,
        statusMessage: 'プロンプトは3文字以上200文字以下で入力してください',
      })
    }

    const result = await generateImage(body)

    // 画像生成成功時にのみカウントを増加（24時間で期限切れ）
    await kv.setex(rateLimitKey, 86400, currentCount + 1)

    return result
  }
  catch (error: any) {
    // レート制限エラーはそのまま投げる
    if (error.statusCode === 429 || error.statusCode === 400) {
      throw error
    }

    // OpenRouter API クレジット不足エラーの場合
    if (error.message && error.message.includes('開発者の資金がなくなりました')) {
      throw createError({
        statusCode: 402,
        statusMessage: '開発者の資金がなくなり、画像が生成できませんでした。',
      })
    }

    console.error('画像生成エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '画像生成に失敗しました。しばらく待ってから再試行してください。',
    })
  }
})
