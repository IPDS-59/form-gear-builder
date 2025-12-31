<script setup lang="ts">
import { onMounted } from 'vue'
import { useUIStore } from '@/stores/uiStore'
import ThreePanelLayout from '@/components/layout/ThreePanelLayout.vue'

const uiStore = useUIStore()

// Initialize dark mode from system preference
onMounted(() => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    uiStore.toggleDarkMode()
  }
})
</script>

<template>
  <div class="h-screen w-screen overflow-hidden">
    <ThreePanelLayout />
  </div>
</template>

<style>
html, body, #app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>
