<script setup lang="ts">
import DefaultHeader from '~/components/layouts/DefaultHeader.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <DefaultHeader />
    <main class="grow py-4">
      <slot />
    </main>
  </div>
</template>
