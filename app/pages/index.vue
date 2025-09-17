<script setup lang="ts">
import { useImage, useImageDownload, useImageShare, useImages } from '~/composables/image'
import { useDevice } from '~/composables/device'

declare global {
  interface Window {
    searchPlaces?: (query: string) => void
  }
}

const config = useRuntimeConfig()
const { isDesktop } = useDevice()

const mapRef = ref<HTMLElement | null>(null)
const marker = ref<google.maps.marker.AdvancedMarkerElement | null>(null)
let map: google.maps.Map | null = null
const isInteracting = ref(false)
const chatContainerRef = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const isSearching = ref(false)
const isSearchComposing = ref(false)

const { prompt, messages, status, isComposing, handleEnter, latLng, onSubmit } = useImage()
const { downloadImage } = useImageDownload()
const { shareImage } = useImageShare()
const { likeImage } = useImages()

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
    }
  })
}

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

const handleSearch = () => {
  if (window.searchPlaces && !isSearchComposing.value) {
    window.searchPlaces(searchQuery.value)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}

// ドキュメントクリックイベントのハンドラー
const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as Node
  const searchInput = document.querySelector('input[name="place"]')

  if (mapRef.value && !mapRef.value.contains(target) && !searchInput?.contains(target)) {
    if (!isDesktop.value) {
      isInteracting.value = false
    }
  }
}

const { onLoaded } = useScriptGoogleMaps({
  apiKey: config.public.google.apiKey,
})

onMounted(() => {
  onLoaded(async (instance: { maps: unknown }) => {
    await nextTick()
    if (!mapRef.value || map) return

    const maps = await instance.maps
    const { Map } = await maps.importLibrary('maps') as google.maps.MapsLibrary
    const { AdvancedMarkerElement } = await maps.importLibrary('marker') as google.maps.MarkerLibrary
    const { PlacesService } = await maps.importLibrary('places') as google.maps.PlacesLibrary

    map = new Map(mapRef.value, {
      center: { lat: 35.685355, lng: 139.753144 },
      zoom: 8,
      mapId: '4dd6c17f0750a29a89cda4c8',
      disableDefaultUI: true,
      gestureHandling: 'greedy',
      clickableIcons: false,
    })

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) {
        return
      }

      if (!isDesktop.value && !isInteracting.value) {
        isInteracting.value = true
        return
      }

      if (marker.value) {
        marker.value.map = null
        marker.value = null
      }

      marker.value = new AdvancedMarkerElement({
        map,
        position: e.latLng,
      })
      latLng.value = e.latLng
      if (!isDesktop.value) {
        isInteracting.value = false
      }
    })
    map.addListener('dragstart', () => {
      if (!isDesktop.value) {
        isInteracting.value = true
      }
    })

    map.addListener('zoom_changed', () => {
      if (!isDesktop.value) {
        isInteracting.value = true
      }
    })

    const placesService = new PlacesService(map)

    const searchPlaces = (query: string) => {
      if (!query.trim()) {
        return
      }

      isSearching.value = true

      const request = {
        query: query,
        fields: ['name', 'geometry', 'formatted_address', 'place_id'],
        locationBias: map?.getCenter(),
      }

      placesService.textSearch(request, (results, status) => {
        isSearching.value = false
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          const firstResult = results[0]
          if (firstResult) {
            selectSearchResult(firstResult)
          }
        }
      })
    }

    const selectSearchResult = (place: google.maps.places.PlaceResult) => {
      if (place.geometry?.location) {
        const location = place.geometry.location
        map?.setCenter(location)
        map?.setZoom(16)

        if (marker.value) {
          marker.value.map = null
          marker.value = null
        }

        marker.value = new AdvancedMarkerElement({
          map,
          position: location,
        })
        latLng.value = location
        searchQuery.value = ''
      }
    }

    window.searchPlaces = searchPlaces
  })

  // ドキュメントクリックイベントの処理
  document.addEventListener('click', handleDocumentClick)
})

onBeforeRouteLeave(() => {
  if (marker.value) {
    marker.value.map = null
    marker.value = null
  }
  if (!isDesktop.value) {
    isInteracting.value = false
  }
})

onUnmounted(() => {
  // ドキュメントクリックイベントのクリーンアップ
  document.removeEventListener('click', handleDocumentClick)

  // 完全なクリーンアップ
  if (marker.value) {
    marker.value.map = null
    marker.value = null
  }
  if (map) {
    map = null
  }
  if (!isDesktop.value) {
    isInteracting.value = false
  }
  latLng.value = null
})

const quickChats = [
  {
    label: '『LEGO』のスタイルで作成してください。',
  },
  {
    label: 'ゲーム『Minecraft』のスタイルで作成してください。',
  },
  {
    label: 'SF映画『ブレードランナー』のスタイルで作成してください。',
  },
  {
    label: 'ゲーム『Pokemon』のスタイルで作成してください。',
  },
]
</script>

<template>
  <UContainer>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:h-[calc(100vh-9.25rem)]">
      <ClientOnly>
        <template #fallback>
          <div class="aspect-[3/1] md:h-full w-full md:max-w-[600px] rounded-xl border border-muted flex items-center justify-center">
            <USkeleton class="w-full h-full rounded-xl" />
          </div>
        </template>

        <div class="relative w-full md:max-w-[600px]">
          <div class="absolute top-2 left-2 right-2 z-10">
            <div class="relative">
              <UInput
                v-model="searchQuery"
                name="place"
                placeholder="場所を検索..."
                class="w-full"
                size="lg"
                @keydown.enter.prevent="handleSearch"
                @compositionstart="isSearchComposing = true"
                @compositionend="isSearchComposing = false"
              >
                <template #trailing>
                  <UButton
                    icon="i-lucide-search"
                    size="xs"
                    variant="ghost"
                    @click="handleSearch"
                  />
                </template>
              </UInput>
            </div>
          </div>

          <div
            ref="mapRef"
            :class="[!isDesktop && isInteracting ? 'aspect-[4/3]' : 'aspect-[3/1]', 'border border-muted transition-all duration-500 md:h-full w-full rounded-xl']"
          />
        </div>
      </ClientOnly>

      <div class="flex flex-col h-full space-y-4 max-w-full">
        <div
          ref="chatContainerRef"
          class="md:flex-1 h-[300px] md:h-[auto] md:max-h-[calc(100vh-17.5rem-3px)] overflow-y-scroll p-4 space-y-4 border border-gray-200 rounded-xl"
        >
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="msg.role === 'user' ? 'text-right' : 'text-left'"
          >
            <UChatMessage
              v-if="msg.role === 'user'"
              :id="'1'"
              variant="soft"
              role="system"
              side="right"
              :parts="[
                {
                  type: 'text',
                  text: msg.text ?? '',
                },
              ]"
              :ui="{
                content: 'border border-muted',
              }"
            />

            <UChatMessage
              v-else-if="msg.type === 'text'"
              :id="'1'"
              variant="soft"
              role="system"
              side="left"
              :parts="[
                {
                  type: 'text',
                  text: msg.content ?? '',
                },
              ]"
              :ui="{
                content: 'border border-muted',
              }"
            />

            <UChatMessage
              v-else-if="msg.type === 'error'"
              :id="'1'"
              variant="soft"
              role="system"
              side="left"
              :parts="[
                {
                  type: 'text',
                  text: msg.content ?? 'エラーが発生しました。',
                },
              ]"
              :ui="{
                content: 'border border-red-200 bg-red-50',
              }"
            />

            <div
              v-else-if="msg.type ==='loading'"
              class="relative w-[300px] aspect-square rounded-lg border border-muted"
            >
              <USkeleton class="w-full h-full rounded-lg" />
              <div class="absolute inset-0 flex items-center justify-center">
                <UIcon
                  name="i-lucide-loader-circle"
                  class="w-8 h-8 text-muted-foreground animate-spin"
                />
              </div>
            </div>

            <div
              v-else-if="msg.type === 'image' && (msg.data || msg.savedUrl)"
              class="space-y-2"
            >
              <UModal>
                <UButton
                  color="neutral"
                  variant="subtle"
                  as="div"
                  :ui="{
                    base: 'p-0 overflow-hidden border border-muted',
                  }"
                >
                  <div
                    class="max-w-[300px] md:max-w-[300px] w-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity duration-200 relative"
                  >
                    <img
                      :src="msg.data ? `data:${msg.mimeType || 'image/png'};base64,${msg.data}` : msg.savedUrl"
                      :alt="'生成された画像'"
                      class="w-full h-auto border border-muted rounded-[5px]"
                    >
                    <div class="absolute bottom-2 right-2 flex items-center">
                      <div class="flex items-center gap-0.5">
                        <span class="text-xs text-muted-foreground">{{ msg.likes || 0 }}</span>
                        <UButton
                          v-if="msg.savedId"
                          variant="ghost"
                          color="neutral"
                          icon="i-lucide-heart"
                          class="cursor-pointer hover:text-red-400"
                          @click.stop="likeImage(msg.savedId)"
                        />
                      </div>
                      <UButton
                        variant="ghost"
                        color="neutral"
                        icon="i-lucide-download"
                        class="cursor-pointer hidden lg:flex"
                        @click.stop="downloadImage(msg.data ? `data:${msg.mimeType || 'image/png'};base64,${msg.data}` : msg.savedUrl)"
                      />
                      <UButton
                        variant="ghost"
                        color="neutral"
                        icon="i-lucide-share"
                        class="cursor-pointer lg:hidden"
                        @click.stop="shareImage(msg.data ? `data:${msg.mimeType || 'image/png'};base64,${msg.data}` : msg.savedUrl)"
                      />
                    </div>
                  </div>
                </UButton>

                <template #content>
                  <div class="flex flex-col">
                    <img
                      :src="msg.data ? `data:${msg.mimeType || 'image/png'};base64,${msg.data}` : msg.savedUrl"
                      :alt="'生成された画像'"
                      class="w-full h-auto object-cover rounded-t-lg"
                    >
                    <div class="p-4 flex justify-end gap-2">
                      <div class="flex items-center gap-1">
                        <span class="text-sm text-gray-600">{{ msg.likes || 0 }}</span>
                        <UButton
                          v-if="msg.savedId"
                          variant="ghost"
                          color="neutral"
                          icon="i-lucide-heart"
                          size="xl"
                          class="cursor-pointer"
                          @click.stop="likeImage(msg.savedId)"
                        />
                      </div>
                      <UButton
                        variant="ghost"
                        color="neutral"
                        icon="i-lucide-download"
                        class="cursor-pointer hidden lg:flex"
                        size="xl"
                        @click.stop="downloadImage(msg.data ? `data:${msg.mimeType || 'image/png'};base64,${msg.data}` : msg.savedUrl)"
                      />
                      <UButton
                        variant="ghost"
                        color="neutral"
                        icon="i-lucide-share"
                        class="cursor-pointer lg:hidden"
                        size="xl"
                        @click.stop="shareImage(msg.data ? `data:${msg.mimeType || 'image/png'};base64,${msg.data}` : msg.savedUrl)"
                      />
                    </div>
                  </div>
                </template>
              </UModal>
            </div>
          </div>
        </div>

        <div class="flex-shrink-0 space-y-2">
          <UChatPrompt
            v-model="prompt"
            :status="status"
            variant="subtle"
            class="rounded-xl"
            placeholder="『LEGO』のスタイルで作成してください。"
            :disabled="status === 'submitted' || status === 'streaming'"
            :ui="{
              base: 'text-sm md:text-base p-0',
              body: 'items-center',
            }"
            @keydown.enter.prevent="handleEnter"
            @compositionstart="isComposing = true"
            @compositionend="isComposing = false"
          >
            <UChatPromptSubmit
              color="neutral"
              variant="solid"
              :disabled="status === 'submitted' || status === 'streaming'"
              :disable="true"
              @click="onSubmit"
            />
          </UChatPrompt>

          <div class="flex gap-x-2 whitespace-nowrap overflow-x-auto w-full scrollbar-none py-2">
            <UButton
              v-for="quickChat in quickChats"
              :key="quickChat.label"
              :label="quickChat.label"
              size="md"
              color="neutral"
              variant="subtle"
              class="rounded-full shrink-0"
              @click="prompt = quickChat.label"
            />
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
