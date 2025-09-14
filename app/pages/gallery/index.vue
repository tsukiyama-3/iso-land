<script setup lang="ts">
// 型定義
interface ImageData {
  id: string
  url: string
  prompt: string
  latitude: number
  longitude: number
  createdAt: string
  likes: number
}

interface ImagesResponse {
  images: ImageData[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface LikeResponse {
  success: boolean
  likes: number
}

interface BreadcrumbItem {
  label: string
  icon?: string
  to?: string
}

// ページのメタデータ
definePageMeta({
  title: '画像ギャラリー',
})

// 状態管理
const images = ref<ImageData[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const selectedImage = ref<ImageData | null>(null)

// ページネーション状態管理
const currentPage = ref(1)
const totalPages = ref(0)
const total = ref(0)
const limit = 3

// いいね状態管理
const isLiking = ref(false)

// 画像ダウンロード機能
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

// 画像シェア機能
const shareImage = async (imageUrl: string, prompt: string) => {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()

    // Web Share APIが利用可能かチェック
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], 'iso-land-image.png', { type: 'image/png' })

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'AIが生成したアイソメトリック画像',
          text: prompt,
          files: [file],
        })
        return
      }
    }

    // Web Share APIが利用できない場合は、画像をダウンロード
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = 'iso-land-image.png'
    link.click()

    // トースト通知
    const toast = useToast()
    toast.add({
      title: '画像をダウンロードしました',
      color: 'success',
    })
  }
  catch (error) {
    console.error('シェアエラー:', error)
    // エラーの場合は画像をダウンロード
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = 'iso-land-image.png'
    link.click()

    const toast = useToast()
    toast.add({
      title: '画像をダウンロードしました',
      color: 'success',
    })
  }
}

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

const breadcrumb = ref<BreadcrumbItem[]>([
  {
    label: 'TOP',
    icon: 'i-lucide-house',
    to: '/',
  },
  {
    label: 'Gallery',
    icon: 'i-lucide-file-heart',
  },
])

// ページマウント時に画像一覧を取得
onMounted(() => {
  fetchImages()
})
</script>

<template>
  <UContainer>
    <UPageHeader
      headline="Gallery"
      title="みんなの作品"
      description="みんなが生成した画像を集めたギャラリーです。気に入った画像はダウンロードやシェアもできます。"
      class="text-left"
    />

    <UBreadcrumb
      :items="breadcrumb"
      class="mt-6"
    />

    <UPage>
      <UPageBody>
        <!-- ローディング状態 -->
        <div
          v-if="isLoading"
          class="text-center py-12"
        >
          <div class="text-gray-400 mb-4">
            <svg
              class="w-16 h-16 mx-auto animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            読み込み中...
          </h3>
        </div>

        <!-- 画像が存在しない場合 -->
        <div
          v-else-if="images.length === 0"
          class="text-center py-12"
        >
          <div class="text-gray-400 mb-4">
            <svg
              class="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            画像がありません
          </h3>
          <p class="text-gray-500 mb-4">
            まだ画像が保存されていません
          </p>
          <UButton
            to="/"
            variant="outline"
          >
            ホームに戻る
          </UButton>
        </div>

        <!-- 画像一覧 -->
        <div
          v-else
          class="space-y-6"
        >
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <UModal
              v-for="image in images"
              :key="image.id"
            >
              <UButton
                color="neutral"
                variant="subtle"
                :ui="{
                  base: 'p-0 overflow-hidden border border-muted',
                }"
              >
                <div
                  class="aspect-square overflow-hidden cursor-pointer hover:opacity-80 transition-opacity duration-200"
                >
                  <img
                    :src="image.url"
                    :alt="image.prompt"
                    class="w-full h-full object-cover"
                  >
                </div>
              </UButton>

              <template #content>
                <div>
                  <img
                    :src="image.url"
                    :alt="image.prompt"
                    class="w-full h-full object-cover aspect-square"
                  >
                  <div class="p-4 flex gap-2">
                    <UButton
                      variant="subtle"
                      icon="i-lucide-download"
                      class="cursor-pointer hidden lg:flex"
                      size="xl"
                      @click="downloadImage(image.url)"
                    />
                    <UButton
                      variant="subtle"
                      icon="i-lucide-share"
                      class="cursor-pointer lg:hidden"
                      size="xl"
                      @click="shareImage(image.url, image.prompt)"
                    />
                    <UButton
                      variant="subtle"
                      icon="i-lucide-heart"
                      size="xl"
                      class="cursor-pointer"
                      @click="likeImage(image.id)"
                    />
                  </div>
                </div>
              </template>
            </UModal>
          </div>

          <!-- ページネーション -->
          <div
            v-if="!isLoading && total > limit"
            class="flex justify-center"
          >
            <UPagination
              v-model:page="currentPage"
              :total="total"
              :items-per-page="limit"
              @update:page="onPageChange"
            />
          </div>

          <!-- ページ情報 -->
          <div
            v-if="!isLoading && total > 0"
            class="text-center text-sm text-gray-500"
          >
            {{ total }}件中 {{ (currentPage - 1) * limit + 1 }}-{{ Math.min(currentPage * limit, total) }}件を表示
            <br>
            <span class="text-xs">ページ {{ currentPage }} / {{ totalPages }}</span>
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
