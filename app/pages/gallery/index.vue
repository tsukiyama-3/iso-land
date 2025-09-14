<template>
  <UContainer class="py-8">
    <div class="max-w-6xl mx-auto">
      <!-- ヘッダー -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          画像ギャラリー
        </h1>
        <p class="text-gray-600">
          保存された画像の一覧です
        </p>
      </div>

      <!-- ローディング状態 -->
      <div
        v-if="isLoading"
        class="text-center py-12"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
        <p class="text-gray-500">
          読み込み中...
        </p>
      </div>

      <!-- エラー状態 -->
      <div
        v-else-if="error"
        class="text-center py-12"
      >
        <div class="text-red-500 mb-4">
          <svg
            class="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <p class="text-red-600 mb-4">
          {{ error }}
        </p>
        <UButton
          variant="outline"
          @click="fetchImages"
        >
          再試行
        </UButton>
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
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
      >
        <div
          v-for="image in images"
          :key="image.id"
          class="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition-opacity duration-200"
          @click="openModal(image)"
        >
          <img
            :src="image.url"
            :alt="image.prompt"
            class="w-full h-full object-cover"
          >
        </div>
      </div>

      <!-- モーダル -->
      <UModal
        v-model="isModalOpen"
        :ui="{ width: 'sm:max-w-2xl' }"
      >
        <UCard v-if="selectedImage">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                画像詳細
              </h3>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-lucide-x"
                @click="closeModal"
              />
            </div>
          </template>

          <div class="space-y-6">
            <!-- 画像 -->
            <div class="aspect-video overflow-hidden rounded-lg">
              <img
                :src="selectedImage.url"
                :alt="selectedImage.prompt"
                class="w-full h-full object-cover"
              >
            </div>

            <!-- 画像情報 -->
            <div class="space-y-4">
              <div>
                <h4 class="font-medium text-gray-900 mb-2">
                  プロンプト
                </h4>
                <p class="text-gray-700">
                  {{ selectedImage.prompt }}
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">
                    位置情報
                  </h4>
                  <div class="flex items-center text-sm text-gray-600">
                    <svg
                      class="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{{ selectedImage.lat?.toFixed(6) }}, {{ selectedImage.lng?.toFixed(6) }}</span>
                  </div>
                </div>

                <div>
                  <h4 class="font-medium text-gray-900 mb-2">
                    作成日時
                  </h4>
                  <div class="flex items-center text-sm text-gray-600">
                    <svg
                      class="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{{ formatDate(selectedImage.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="font-medium text-gray-900 mb-2">
                  画像ID
                </h4>
                <p class="text-sm text-gray-600 font-mono">
                  {{ selectedImage.id }}
                </p>
              </div>

              <div>
                <h4 class="font-medium text-gray-900 mb-2">
                  いいね数
                </h4>
                <div class="flex items-center gap-2">
                  <span class="text-lg font-semibold text-gray-700">
                    {{ selectedImage.likes || 0 }}
                  </span>
                  <UButton
                    :loading="isLiking"
                    size="sm"
                    variant="outline"
                    icon="i-lucide-heart"
                    color="error"
                    @click="likeImage(selectedImage.id)"
                  >
                    いいね
                  </UButton>
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex gap-3">
              <UButton
                :to="selectedImage.url"
                target="_blank"
                variant="outline"
                icon="i-lucide-external-link"
                class="flex-1"
              >
                画像を開く
              </UButton>
              <UButton
                variant="outline"
                icon="i-lucide-copy"
                @click="copyImageUrl(selectedImage.url)"
              >
                URLをコピー
              </UButton>
            </div>
          </template>
        </UCard>
      </UModal>

      <!-- フッター -->
      <div class="text-center mt-12 pt-8 border-t border-gray-200">
        <UButton
          to="/"
          variant="outline"
        >
          ホームに戻る
        </UButton>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
// ページのメタデータ
definePageMeta({
  title: '画像ギャラリー',
})

// 状態管理
const images = ref<any[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// モーダル状態管理
const isModalOpen = ref(false)
const selectedImage = ref<any>(null)

// いいね状態管理
const isLiking = ref(false)

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

// 日付をフォーマットする関数
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// モーダルを開く関数
const openModal = (image: any) => {
  selectedImage.value = image
  isModalOpen.value = true
}

// モーダルを閉じる関数
const closeModal = () => {
  isModalOpen.value = false
  selectedImage.value = null
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

// URLをクリップボードにコピーする関数
const copyImageUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    // トースト通知を表示（Nuxt UIのトースト機能を使用）
    const toast = useToast()
    toast.add({
      title: 'URLをコピーしました',
      color: 'success',
    })
  }
  catch (err) {
    console.error('コピーに失敗:', err)
  }
}

// ページマウント時に画像一覧を取得
onMounted(() => {
  fetchImages()
})
</script>
