<script setup lang="ts">
import { useImages, useImageDownload, useImageShare } from '~/composables/image'

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
                as="div"
                :ui="{
                  base: 'p-0 overflow-hidden border border-muted',
                }"
              >
                <div
                  class="aspect-square overflow-hidden cursor-pointer hover:opacity-80 transition-opacity duration-200"
                >
                  <NuxtImg
                    :src="image.url"
                    :alt="image.prompt"
                    class="w-full h-full object-cover block"
                    loading="lazy"
                    :width="300"
                    :height="300"
                    format="avif,webp"
                    quality="80"
                    sizes="sm:300px md:300px lg:300px xl:300px"
                  >
                    <template #placeholder>
                      <USkeleton class="w-full h-full rounded-none block" />
                    </template>
                  </NuxtImg>
                </div>
              </UButton>

              <template #content>
                <div>
                  <div class="aspect-square">
                    <NuxtImg
                      :src="image.url"
                      :alt="image.prompt"
                      class="w-full h-full object-cover block"
                      loading="eager"
                      :width="800"
                      :height="800"
                      format="avif,webp"
                      quality="90"
                      sizes="sm:400px md:600px lg:800px xl:800px"
                    >
                      <template #placeholder>
                        <USkeleton class="w-full h-full rounded-none block" />
                      </template>
                    </NuxtImg>
                  </div>
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
                      @click="shareImage(image.url)"
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
