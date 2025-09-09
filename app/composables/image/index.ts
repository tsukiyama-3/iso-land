export const useImage = () => {
  const prompt = ref('')
  const status = ref<'ready' | 'submitted' | 'streaming' | 'error'>('ready')
  const isComposing = ref(false)

  const messages = ref<
    { role: 'user' | 'assistant', type: string, content?: string, mimeType?: string, data?: string }[]
  >([])

  const onSubmit = async () => {
    console.log('onSubmit', prompt.value, prompt.value.trim())
    if (!prompt.value.trim()) return

    status.value = 'submitted'

    // ユーザーメッセージ追加
    messages.value.push({
      role: 'user',
      type: 'text',
      content: prompt.value,
    })

    // ローディングメッセージ追加
    const loadingIndex
      = messages.value.push({
        role: 'assistant',
        type: 'loading',
        content: '生成中…',
      }) - 1

    try {
      status.value = 'streaming'
      const { data } = await useFetch('/api/ai/image', {
        method: 'POST',
        body: { prompt: prompt.value },
      })
      console.log(data.value, 'data')

      // ローディングを置き換え
      messages.value[loadingIndex] = {
        role: 'assistant',
        type: data.value?.type || 'text',
        content: data.value?.data,
        mimeType: data.value?.mimeType,
        data: data.value?.data,
      }
      status.value = 'ready'
    }
    catch {
      messages.value[loadingIndex] = {
        role: 'assistant',
        type: 'text',
        content: 'エラーが発生しました。',
      }
      status.value = 'error'
    }
    finally {
      prompt.value = ''
    }
  }

  const handleEnter = (e: KeyboardEvent) => {
    if (isComposing.value) {
      return
    }

    if (!e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return { prompt, messages, onSubmit, status, isComposing, handleEnter }
}
