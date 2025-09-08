<script setup lang="ts">
import { useImage } from '~/composables/image'

const config = useRuntimeConfig()

const mapRef = ref<HTMLElement | null>(null)

const { image, status, download } = await useImage()

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
  <div>
    <h1>Index</h1>
    <div
      class="grid grid-cols-2"
    >
      <div
        ref="mapRef"
        class="aspect-square w-full rounded-xl"
      />
      <div>
        <UButton @click="download">
          Download
        </UButton>
        <img
          :src="`data:${image?.mimeType};base64,${image?.data}`"
          alt=""
          width="500"
          height="500"
        >
      </div>
    </div>
  </div>
</template>
