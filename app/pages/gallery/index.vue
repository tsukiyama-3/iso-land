<script setup lang="ts">
import { useImages, useImageDownload, useImageShare } from '~/composables/image/index'

interface BreadcrumbItem {
  label: string
  icon?: string
  to?: string
}

// ページのメタデータ
definePageMeta({
  title: '画像ギャラリー',
})

// composablesを使用
const {
  images,
  isLoading,
  currentPage,
  totalPages,
  total,
  limit,
  fetchImages,
  onPageChange,
  likeImage,
} = useImages()

const { downloadImage } = useImageDownload()
const { shareImage } = useImageShare()

// 画像ロードハンドラー
const handleImageLoad = (payload: string | Event) => {
  if (typeof payload === 'string') return
  const target = payload.target as HTMLImageElement | null
  const loadingOverlay = target?.parentElement?.querySelector('.loading-overlay') as HTMLElement
  if (loadingOverlay) loadingOverlay.style.display = 'none'
}

const handleImageError = (payload: string | Event) => {
  if (typeof payload === 'string') return
  const target = payload.target as HTMLImageElement | null
  const loadingOverlay = target?.parentElement?.querySelector('.loading-overlay') as HTMLElement
  if (loadingOverlay) loadingOverlay.style.display = 'none'
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
          <div class="text-muted-foreground mb-4">
            <UIcon
              name="i-lucide-loader-circle"
              class="w-16 h-16 mx-auto animate-spin"
            />
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
                as="div"
                :ui="{
                  base: 'p-0 overflow-hidden border border-muted aspect-square',
                }"
              >
                <div
                  class="relative aspect-square overflow-hidden cursor-pointer hover:opacity-80 transition-opacity duration-200"
                >
                  <!-- ボタンエリアを固定位置に配置 -->
                  <div class="absolute bottom-0 right-0 flex items-center z-10">
                    <div class="flex items-center gap-0.5">
                      <span class="text-xs text-muted-foreground">{{ image.likes || 0 }}</span>
                      <UButton
                        variant="ghost"
                        color="neutral"
                        icon="i-lucide-heart"
                        size="sm"
                        class="cursor-pointer hover:text-red-400"
                        @click.stop="likeImage(image.id)"
                      />
                    </div>
                    <UButton
                      variant="ghost"
                      color="neutral"
                      icon="i-lucide-download"
                      class="cursor-pointer hidden lg:flex"
                      size="sm"
                      @click.stop="downloadImage(image.url)"
                    />
                    <UButton
                      variant="ghost"
                      color="neutral"
                      icon="i-lucide-share"
                      class="cursor-pointer lg:hidden"
                      size="sm"
                      @click.stop="shareImage(image.url)"
                    />
                  </div>
                  <!-- 画像エリア -->
                  <div class="w-full h-full relative">
                    <NuxtImg
                      :src="image.url"
                      :alt="image.prompt"
                      class="w-full h-full object-cover block"
                      loading="lazy"
                      :width="200"
                      :height="200"
                      format="avif,webp"
                      quality="40"
                      sizes="(max-width: 640px) 150px, (max-width: 768px) 200px, (max-width: 1024px) 250px, 200px"
                      preload
                      densities="1x 2x"
                    >
                      <template #placeholder>
                        <USkeleton class="w-full h-full rounded-none" />
                      </template>
                    </NuxtImg>
                  </div>
                </div>
              </UButton>

              <template #content>
                <div>
                  <div class="aspect-square relative">
                    <NuxtImg
                      :src="image.url"
                      :alt="image.prompt"
                      class="w-full h-full object-cover block"
                      loading="eager"
                      :width="600"
                      :height="600"
                      format="avif,webp"
                      quality="50"
                      sizes="sm:300px md:400px lg:600px xl:600px"
                      @load="handleImageLoad"
                      @error="handleImageError"
                    >
                      <template #placeholder>
                        <USkeleton class="w-full h-full rounded-none block" />
                      </template>
                    </NuxtImg>
                    <div class="loading-overlay absolute inset-0 flex items-center justify-center bg-white">
                      <UIcon
                        name="i-lucide-loader-circle"
                        class="w-8 h-8 text-muted-foreground animate-spin"
                      />
                    </div>
                  </div>
                  <div class="p-4 flex justify-end gap-2">
                    <div class="flex items-center gap-1">
                      <span class="text-sm text-gray-600">{{ image.likes || 0 }}</span>
                      <UButton
                        variant="ghost"
                        color="neutral"
                        icon="i-lucide-heart"
                        size="xl"
                        class="cursor-pointer"
                        @click.stop="likeImage(image.id)"
                      />
                    </div>
                    <UButton
                      variant="ghost"
                      color="neutral"
                      icon="i-lucide-download"
                      class="cursor-pointer hidden lg:flex"
                      size="xl"
                      @click.stop="downloadImage(image.url)"
                    />
                    <UButton
                      variant="ghost"
                      color="neutral"
                      icon="i-lucide-share"
                      class="cursor-pointer lg:hidden"
                      size="xl"
                      @click.stop="shareImage(image.url)"
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
