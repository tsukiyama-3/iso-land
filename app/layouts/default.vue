<script setup lang="ts">
import DefaultHeader from '~/components/layouts/DefaultHeader.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <DefaultHeader />
    <main class="py-4 grow">
      <slot />
    </main>
    <footer class="py-4">
      <p class="text-muted text-center text-sm">
        Copyright © {{ new Date().getFullYear() }}
      </p>
    </footer>
  </div>
</template>
