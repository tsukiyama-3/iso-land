type UserMessage = {
  role: 'user'
  type: 'text'
  text: string
}

type AssistantTextMessage = {
  role: 'assistant'
  type: 'text' | 'loading' | 'error'
  content: string
  mimeType?: string
  data?: string
}

type AssistantImageMessage = {
  role: 'assistant'
  type: 'image'
  content: string
  mimeType: string
  data: string
  savedUrl?: string
  savedId?: string
}

type ChatMessage = UserMessage | AssistantTextMessage | AssistantImageMessage

export const useImage = () => {
  const toast = useToast()
  const prompt = ref('')
  const status = ref<'ready' | 'submitted' | 'streaming' | 'error'>('ready')
  const isComposing = ref(false)
  const latLng = ref<google.maps.MapMouseEvent['latLng'] | null>(null)

  const messages = ref<ChatMessage[]>([
    {
      role: 'assistant',
      type: 'text',
      content: 'ようこそ',
    },
  ])

  const onSubmit = async () => {
    console.log('onSubmit', prompt.value, prompt.value.trim())
    if (!prompt.value.trim()) {
      return
    }
    if (!latLng.value) {
      toast.add({
        title: 'マップにピンを立ててください。',
        color: 'error',
      })
      return
    }

    const userPrompt = prompt.value
    prompt.value = ''

    status.value = 'submitted'

    messages.value.push({
      role: 'user',
      type: 'text',
      text: userPrompt,
    })

    const loadingIndex
      = messages.value.push({
        role: 'assistant',
        type: 'loading',
        content: '生成中…',
      }) - 1

    try {
      status.value = 'streaming'

      const data = await $fetch('/api/ai/image', {
        method: 'POST',
        body: {
          prompt: userPrompt,
          latLng: {
            lat: latLng.value?.lat(),
            lng: latLng.value?.lng(),
          },
        },
      })

      // ローディングを置き換え
      messages.value[loadingIndex] = {
        role: 'assistant',
        type: (data?.type as 'text' | 'image') || 'text',
        content: data?.content || '',
        mimeType: data?.mimeType || '',
        data: data?.data || '',
        savedUrl: data?.savedUrl || '',
        savedId: data?.savedId || '',
      }
      status.value = 'ready'
      toast.add({
        title: '画像生成に成功しました🎉',
        color: 'success',
      })
    }
    catch (error: any) {
      messages.value[loadingIndex] = {
        role: 'assistant',
        type: 'error',
        content: error.data?.message || 'エラーが発生しました。',
        mimeType: '',
        data: '',
      } as AssistantTextMessage
      status.value = 'error'

      // エラーメッセージの表示
      if (error.statusCode === 429) {
        toast.add({
          title: error.data?.message || '本日の使用回数制限に達しました。',
          color: 'error',
        })
      }
      else {
        toast.add({
          title: error.data?.message || 'エラーが発生しました。もう一度お試しください。',
          color: 'error',
        })
      }
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
