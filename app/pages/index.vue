<script setup lang="ts">
import { useImage } from '~/composables/image'

declare global {
  interface Window {
    searchPlaces?: (query: string) => void
  }
}

const config = useRuntimeConfig()

const mapRef = ref<HTMLElement | null>(null)
const marker = ref<google.maps.marker.AdvancedMarkerElement | null>(null)
let map: google.maps.Map | null = null
const isInteracting = ref(false)
const chatContainerRef = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const isSearching = ref(false)
const isSearchComposing = ref(false)

const { prompt, messages, status, isComposing, handleEnter, latLng, onSubmit } = useImage()

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
    isInteracting.value = false
  }
}

const { onLoaded } = useScriptGoogleMaps({
  apiKey: config.public.google.apiKey,
})

onMounted(() => {
  onLoaded(async (instance: { maps: any }) => {
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

      if (!isInteracting.value) {
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
      isInteracting.value = false
    })
    map.addListener('dragstart', () => {
      isInteracting.value = true
    })

    map.addListener('zoom_changed', () => {
      isInteracting.value = true
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
  isInteracting.value = false
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
  isInteracting.value = false
  latLng.value = null
})

const quickChats = [
  {
    label: 'ゲーム『Minecraft』のスタイルで作成してください。',
  },
  {
    label: '『LEGO』のスタイルで作成してください。',
  },
  {
    label: 'ゲーム『Theme Park』のスタイルで作成してください。',
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
                    v-if="searchQuery"
                    icon="i-lucide-x"
                    size="xs"
                    variant="ghost"
                    @click="clearSearch"
                  />
                  <UButton
                    v-else
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
            :class="[isInteracting ? 'aspect-[4/3]' : 'aspect-[3/1]', 'border border-muted transition-all duration-500 md:h-full w-full rounded-xl']"
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

            <USkeleton
              v-else-if="msg.type ==='loading'"
              class="w-[300px] aspect-square rounded-lg border border-muted"
            />

            <div
              v-else-if="msg.type === 'image'"
              class="space-y-2"
            >
              <NuxtImg
                :src="`data:${msg.mimeType};base64,${msg.data}`"
                class="rounded-lg max-w-[300px] inline-block border border-muted"
              />
              <div
                v-if="msg.savedUrl"
                class="text-xs text-gray-500 space-y-1"
              >
                <div>保存済み画像:</div>
                <UButton
                  :to="msg.savedUrl"
                  target="_blank"
                  size="xs"
                  variant="outline"
                  icon="i-lucide-external-link"
                >
                  画像を開く
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-shrink-0 space-y-2">
          <UChatPrompt
            v-model="prompt"
            :status="status"
            variant="subtle"
            class="rounded-xl"
            placeholder="マインクラフト風にしてください。"
            :disabled="status === 'submitted' || status === 'streaming'"
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
              color="primary"
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
