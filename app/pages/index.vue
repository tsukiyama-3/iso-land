<script setup lang="ts">
import { useImage } from '~/composables/image'

const config = useRuntimeConfig()

const mapRef = ref<HTMLElement | null>(null)
const marker = ref<any>(null)
const chatContainerRef = ref<HTMLElement | null>(null)

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

const { onLoaded } = useScriptGoogleMaps({
  apiKey: config.public.google.apiKey,
})

onMounted(() => {
  onLoaded(async (instance) => {
    if (!mapRef.value) return

    const maps = await instance.maps
    const { Map } = await maps.importLibrary('maps') as google.maps.MapsLibrary
    const { AdvancedMarkerElement } = await maps.importLibrary('marker') as google.maps.MarkerLibrary

    const map = new Map(mapRef.value, {
      center: { lat: 35.685355, lng: 139.753144 },
      zoom: 8,
      mapId: '4dd6c17f0750a29a89cda4c8', // 👈 Cloud Console で発行した mapId
    })

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return

      if (marker.value) {
        marker.value.map = null
        marker.value = null
      }

      marker.value = new AdvancedMarkerElement({
        map,
        position: e.latLng,
      })
      latLng.value = e.latLng
    })
  })
})

const quickChats = [
  {
    label: 'ゲーム『Minecraft』のスタイルで作成してください。',
    icon: 'material-icon-theme:minecraft',
  },
  {
    label: 'ゲーム『Theme Park』のスタイルで作成してください。',
  },
  {
    label: '『LEGO』のスタイルで作成してください。',

  },
]
</script>

<template>
  <UContainer>
    <h1>Chat</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        ref="mapRef"
        class="aspect-[4/3] md:aspect-square w-full md:max-w-[600px] rounded-xl"
      />

      <div class="flex flex-col h-full space-y-4 aspect-square">
        <div
          ref="chatContainerRef"
          class="h-[300px] md:h-[536px] overflow-y-auto p-4 space-y-4 border border-gray-200 rounded-xl"
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

            <img
              v-else-if="msg.type === 'image'"
              :src="`data:${msg.mimeType};base64,${msg.data}`"
              class="rounded-lg max-w-[300px] inline-block border border-muted"
            >
          </div>
        </div>

        <div class="flex-shrink-0">
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
              :disabled="status === 'submitted' || status === 'streaming'"
              :disable="true"
              @click="onSubmit"
            />
          </UChatPrompt>

          <div class="flex gap-x-2 whitespace-nowrap overflow-x-auto w-full scrollbar-none py-2">
            <UButton
              v-for="quickChat in quickChats"
              :key="quickChat.label"
              :icon="quickChat.icon"
              :label="quickChat.label"
              size="sm"
              color="neutral"
              variant="outline"
              class="rounded-full shrink-0"
            />
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
