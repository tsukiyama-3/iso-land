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
  likes?: number
}

type ChatMessage = UserMessage | AssistantTextMessage | AssistantImageMessage

// ギャラリー用の型定義
export interface ImageData {
  id: string
  url: string
  prompt: string
  latitude: number
  longitude: number
  createdAt: string
  likes: number
}

export interface ImagesResponse {
  images: ImageData[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface LikeResponse {
  success: boolean
  likes: number
}

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
      content: '1日5回まで画像を生成できます。画像生成には10秒ほどかかります。',
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
        likes: 0, // 新しく生成された画像のいいね数は0から開始
      }
      status.value = 'ready'
      toast.add({
        title: '画像生成に成功しました🎉',
        color: 'success',
      })
    }
    catch (error: any) {
      // エラーメッセージを取得（複数のパターンに対応）
      const errorMessage = error.data?.message || error.message || error.data?.statusMessage || 'エラーが発生しました。'

      messages.value[loadingIndex] = {
        role: 'assistant',
        type: 'error',
        content: errorMessage,
        mimeType: '',
        data: '',
      } as AssistantTextMessage
      status.value = 'error'

      // エラーメッセージの表示
      if (error.statusCode === 429) {
        toast.add({
          title: errorMessage,
          color: 'error',
        })
      }
      else if (error.statusCode === 402) {
        toast.add({
          title: errorMessage,
          color: 'warning',
        })
      }
      else {
        toast.add({
          title: errorMessage,
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

// ギャラリー用のcomposable
export const useImages = () => {
  // 状態管理
  const images = ref<ImageData[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const selectedImage = ref<ImageData | null>(null)

  // ページネーション状態管理
  const currentPage = ref(1)
  const totalPages = ref(0)
  const total = ref(0)
  const limit = 30

  // いいね状態管理
  const isLiking = ref(false)

  // 画像一覧を取得する関数
  const fetchImages = async (page: number = 1) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await $fetch<ImagesResponse>(`/api/images?page=${page}&limit=${limit}`)

      if (response) {
        images.value = response.images || []
        currentPage.value = response.page || 1
        totalPages.value = response.totalPages || 0
        total.value = response.total || 0
      }
    }
    catch (err) {
      console.error('画像一覧取得エラー:', err)
      error.value = '画像一覧の取得に失敗しました'
    }
    finally {
      isLoading.value = false
    }
  }

  // ページ変更時の処理
  const onPageChange = (page: number) => {
    currentPage.value = page
    fetchImages(page)
  }

  // いいね機能
  const likeImage = async (imageId: string) => {
    try {
      isLiking.value = true

      const response = await $fetch<LikeResponse>(`/api/images/${imageId}/like`, {
        method: 'POST',
      })

      if (response.success) {
        // モーダル内のいいね数を更新
        if (selectedImage.value && selectedImage.value.id === imageId) {
          selectedImage.value.likes = response.likes
        }

        // 画像一覧のいいね数も更新
        const imageIndex = images.value.findIndex((img: ImageData) => img.id === imageId)
        if (imageIndex !== -1 && images.value[imageIndex]) {
          images.value[imageIndex].likes = response.likes
        }

        // トースト通知
        const toast = useToast()
        toast.add({
          title: 'いいねしました！',
          color: 'success',
        })
      }
    }
    catch (err) {
      console.error('いいねエラー:', err)
      const toast = useToast()
      toast.add({
        title: 'いいねに失敗しました',
        color: 'error',
      })
    }
    finally {
      isLiking.value = false
    }
  }

  return {
    // 状態
    images: readonly(images),
    isLoading: readonly(isLoading),
    error: readonly(error),
    selectedImage,
    currentPage,
    totalPages: readonly(totalPages),
    total: readonly(total),
    limit,
    isLiking: readonly(isLiking),

    // メソッド
    fetchImages,
    onPageChange,
    likeImage,
  }
}

// 画像ダウンロード機能
export const useImageDownload = () => {
  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()

      // ファイル名を生成
      const fileName = `iso-land_image_${Date.now()}.png`

      // ダウンロードリンクを作成
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // トースト通知
      const toast = useToast()
      toast.add({
        title: '画像をダウンロードしました',
        color: 'success',
      })
    }
    catch (error) {
      console.error('ダウンロードエラー:', error)
      const toast = useToast()
      toast.add({
        title: 'ダウンロードに失敗しました',
        color: 'error',
      })
    }
  }

  return {
    downloadImage,
  }
}

// 画像シェア機能
export const useImageShare = () => {
  const shareImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()

      // Web Share APIが利用可能かチェック
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'iso-land-image.png', { type: 'image/png' })

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            text: 'https://isometric.land #iso_land ',
            files: [file],
          })
          return
        }
        return
      }
    }
    catch (error) {
      console.error('シェアエラー:', error)
    }
  }

  return {
    shareImage,
  }
}
