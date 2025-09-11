<script setup lang="ts">
const config = useRuntimeConfig()
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
