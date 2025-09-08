export const useImage = () => {
  const prompt = ref('')
  const messages = ref<{ role: 'user' | 'assistant', type: 'text' | 'image' | 'loading', content?: string, mimeType?: string, data?: string }[]>([])

  const onSubmit = async () => {
    if (!prompt.value.trim()) return

    // ユーザーメッセージ追加
    messages.value.push({
      role: 'user',
      type: 'text',
      content: prompt.value,
    })

    // ローディングメッセージ追加
    const loadingIndex = messages.value.push({
      role: 'assistant',
      type: 'loading',
      content: '生成中…',
    }) - 1

    try {
      const { data } = await useFetch('/api/ai/image', {
        method: 'POST',
        body: { prompt: prompt.value },
      })


      // ローディングを置き換え
      messages.value[loadingIndex] = {
        role: 'assistant',
        type: data.value?.type || 'text',
        content: data.value?.data,
        mimeType: data.value?.mimeType,
        data: data.value?.data,
      }
    }
    catch {
      messages.value[loadingIndex] = {
        role: 'assistant',
        type: 'text',
        content: 'エラーが発生しました。',
      }
    }
    finally {
      prompt.value = ''
    }
  }

  return { prompt, messages, onSubmit }
}
