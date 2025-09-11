<script setup lang="ts">
const config = useRuntimeConfig()

const items = computed(() => {
  return [
    {
      label: 'TOP',
      to: '/',
    },
    {
      label: 'About',
      to: '/about',
    },
    {
      label: 'Gallery',
      to: '/gallery',
    },
  ]
})
</script>

<template>
  <UHeader>
    <template #title>
      <NuxtImg
        provider="cloudinary"
        :src="`${config.public.cloudinary.baseUrl}/logo_iso-land_shliv5.svg`"
        alt=""
        width="120"
        height="48"
      />
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
      class="font-bold"
      :ui="{
        linkLabel: 'font-bold',
      }"
    />

    <template #right>
      <div class="hidden md:block">
        <UButton
          icon="i-simple-icons-x"
          color="neutral"
          variant="ghost"
          size="xl"
          to="https://x.com/tsuyakima3"
          target="_blank"
          aria-label="X"
        />
        <UButton
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
          size="xl"
          to="https://github.com/tsukiyama-3/iso-land"
          target="_blank"
          aria-label="GitHub"
        />
      </div>
    </template>
    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
        :ui="{
          linkLabel: 'font-bold',
        }"
      />
      <div class="flex items-center justify-center">
        <UButton
          icon="i-simple-icons-x"
          color="neutral"
          variant="ghost"
          size="xl"
          to="https://x.com/tsuyakima3"
          target="_blank"
          aria-label="X"
        />
        <UButton
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
          size="xl"
          to="https://github.com/tsukiyama-3/iso-land"
          target="_blank"
          aria-label="GitHub"
        />
      </div>
    </template>
  </UHeader>
</template>
