<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
// ページのメタデータ
definePageMeta({
  title: '画像ギャラリー',
})

// 状態管理
const images = ref<any[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const selectedImage = ref<any>(null)

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
const fetchImages = async () => {
  try {
    isLoading.value = true
    error.value = null
    const response = await $fetch('/api/images')
    images.value = response || []
  }
  catch (err) {
    console.error('画像一覧取得エラー:', err)
    error.value = '画像一覧の取得に失敗しました'
  }
  finally {
    isLoading.value = false
  }
}

// いいね機能
const likeImage = async (imageId: string) => {
  try {
    isLiking.value = true

    const response = await $fetch(`/api/images/${imageId}/like`, {
      method: 'POST',
    })

    if (response.success) {
      // モーダル内のいいね数を更新
      if (selectedImage.value && selectedImage.value.id === imageId) {
        selectedImage.value.likes = response.likes
      }

      // 画像一覧のいいね数も更新
      const imageIndex = images.value.findIndex(img => img.id === imageId)
      if (imageIndex !== -1) {
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
      description="ユーザーが生成したアイソメトリックな街のイラストを集めたギャラリーです。気に入った画像はダウンロードやシェアもできます。"
      class="text-left"
    />

    <UBreadcrumb
      :items="breadcrumb"
      class="mt-6"
    />

    <UPage>
      <UPageBody>
        <!-- 画像が存在しない場合 -->
        <div
          v-if="images.length === 0"
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
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
        >
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
                <div class="p-4 flex">
                  <UButton
                    variant="subtle"
                    icon="i-lucide-download"
                    size="xl"
                    class="hidden lg:block"
                    @click="downloadImage(image.url)"
                  />
                  <UButton
                    variant="subtle"
                    icon="i-lucide-share"
                    class="block lg:hidden"
                    size="xl"
                    @click="shareImage(image.url, image.prompt)"
                  />
                  <UButton
                    variant="subtle"
                    icon="i-lucide-heart"
                    size="xl"
                    class="block"
                    @click="likeImage(image.id)"
                  />
                </div>
              </div>
            </template>
          </UModal>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
