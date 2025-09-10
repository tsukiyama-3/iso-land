<script setup lang="ts">
import DefaultHeader from '~/components/layouts/DefaultHeader.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <DefaultHeader />
    <main class="grow py-4">
      <slot />
    </main>
    <UFooter :ui="{ container: 'py-4' }">
      <template #left>
        <p class="text-muted text-sm">
          Copyright © {{ new Date().getFullYear() }}
        </p>
      </template>
      <template #right>
        <UButton
          icon="i-simple-icons-x"
          color="neutral"
          variant="ghost"
          to="https://x.com/tsuyakima3"
          target="_blank"
          aria-label="X"
        />
        <UButton
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
          to="https://github.com/tsukiyama-3/iso-land"
          target="_blank"
          aria-label="GitHub"
        />
      </template>
    </UFooter>
  </div>
</template>
