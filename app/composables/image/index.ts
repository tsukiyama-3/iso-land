type UserMessage = {
  role: 'user'
  type: 'text'
  text: string
}

type AssistantTextMessage = {
  role: 'assistant'
  type: 'text' | 'loading' | 'error'
  content: string
}

type AssistantImageMessage = {
  role: 'assistant'
  type: 'image'
  mimeType: string
  data: string
}

type ChatMessage = UserMessage | AssistantTextMessage | AssistantImageMessage

export const useImage = () => {
  const prompt = ref('')
  const status = ref<'ready' | 'submitted' | 'streaming' | 'error'>('ready')
  const isComposing = ref(false)
  const latLng = ref<google.maps.MapMouseEvent['latLng'] | null>(null)

  const messages = ref<ChatMessage[]>([])

  const onSubmit = async () => {
    console.log('onSubmit', prompt.value, prompt.value.trim())
    if (!prompt.value.trim()) {
      return
    }
    if (!latLng.value) {
      return
    }

    status.value = 'submitted'

    messages.value.push({
      role: 'user',
      type: 'text',
      text: prompt.value,
    })

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
        body: { prompt: prompt.value, latLng },
      })
      console.log(data.value, 'data')

      // ローディングを置き換え
      messages.value[loadingIndex] = {
        role: 'assistant',
        type: data.value?.type || 'text',
        content: data.value?.data,
        mimeType: data.value?.mimeType ?? '',
        text: data.value?.content ?? '',
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

  return { prompt, messages, onSubmit, status, isComposing, handleEnter, latLng }
}
