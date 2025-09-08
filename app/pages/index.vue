<script setup lang="ts">
import { useImage } from '~/composables/image'

const config = useRuntimeConfig()

const mapRef = ref<HTMLElement | null>(null)

const { prompt, messages, onSubmit } = useImage()

const { onLoaded } = useScriptGoogleMaps({
  apiKey: config.public.google.apiKey,
})

onMounted(() => {
  onLoaded(async (instance) => {
    if (!mapRef.value) {
      return
    }

    const maps = await instance.maps
    const { Map } = await maps.importLibrary('maps') as google.maps.MapsLibrary

    new Map(mapRef.value, {
      center: { lat: 35.685355, lng: 139.753144 },
      zoom: 8,
    })
  })
})
</script>

<template>
  <UContainer>
    <h1>Chat</h1>

    <!-- メッセージ一覧 -->
    <div class="space-y-4 my-4">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="msg.role === 'user' ? 'text-right' : 'text-left'"
      >
        <!-- テキスト -->
        <p v-if="msg.type === 'text'">
          {{ msg.content }}
        </p>

        <!-- ローディング -->
        <p
          v-else-if="msg.type === 'loading'"
          class="italic text-gray-500"
        >
          {{ msg.content }}
        </p>

        <!-- 画像 -->
        <img
          v-else-if="msg.type === 'image'"
          :src="`data:${msg.mimeType};base64,${msg.data}`"
          class="rounded-lg max-w-[300px] inline-block"
        >
      </div>
    </div>

    <!-- 入力フォーム -->
    <UChatPrompt
      v-model="prompt"
      class="[view-transition-name:chat-prompt]"
      variant="subtle"
      @submit="onSubmit"
    >
      <UChatPromptSubmit color="neutral" />
    </UChatPrompt>
  </UContainer>
</template>
