<script setup lang="ts">
import { computed } from 'vue'
import { useTemplateStore } from '@/stores/templateStore'
import { useUIStore } from '@/stores/uiStore'
import CanvasComponent from './CanvasComponent.vue'
import DropZone from './DropZone.vue'

const templateStore = useTemplateStore()
const uiStore = useUIStore()

// Get root level components (no parent)
const rootComponents = computed(() =>
  templateStore.components.filter(c => !c._parent)
)

// Check if canvas is empty
const isEmpty = computed(() => rootComponents.value.length === 0)
</script>

<template>
  <div class="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
    <!-- Form Header -->
    <div class="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <input
        v-model="templateStore.metadata.title"
        type="text"
        placeholder="Form Title"
        class="text-xl font-semibold w-full bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
      >
      <input
        v-model="templateStore.metadata.description"
        type="text"
        placeholder="Form description..."
        class="text-sm w-full bg-transparent border-none focus:outline-none text-gray-500 dark:text-gray-400 placeholder-gray-400 mt-1"
      >
      <div class="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
        <div class="flex items-center gap-1">
          <span>DataKey:</span>
          <input
            v-model="templateStore.metadata.dataKey"
            type="text"
            placeholder="form_datakey"
            class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
        </div>
        <div class="flex items-center gap-1">
          <span>Acronym:</span>
          <input
            v-model="templateStore.metadata.acronym"
            type="text"
            placeholder="FG"
            class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded w-16 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
        </div>
        <div class="flex items-center gap-1">
          <span>Version:</span>
          <input
            v-model="templateStore.metadata.version"
            type="text"
            placeholder="1.0.0"
            class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded w-20 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
        </div>
      </div>
    </div>

    <!-- Canvas Area -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- When empty: show drop zone with empty state message inside -->
      <div v-if="isEmpty" class="h-full">
        <DropZone
          position="end"
          :index="0"
          class="h-full min-h-64"
        />
      </div>

      <!-- When has components: show components list with drop zones -->
      <div v-else class="space-y-2">
        <!-- Top drop zone -->
        <DropZone
          position="before"
          :index="0"
        />

        <!-- Render each component -->
        <template v-for="(component, index) in rootComponents" :key="component._id">
          <CanvasComponent
            :component="component"
            :index="index"
          />

          <!-- Drop zone after each component -->
          <DropZone
            position="after"
            :index="index + 1"
          />
        </template>
      </div>
    </div>
  </div>
</template>
