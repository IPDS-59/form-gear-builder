<script setup lang="ts">
import type { ComponentTypeInfo } from '@/types'
import { useUIStore } from '@/stores/uiStore'

const props = defineProps<{
  component: ComponentTypeInfo
}>()

const uiStore = useUIStore()

function handleDragStart(e: DragEvent) {
  if (!e.dataTransfer) return

  const dragData = {
    type: 'new-component',
    componentType: props.component.type,
    defaultProps: props.component.defaultProps
  }

  e.dataTransfer.setData('application/json', JSON.stringify(dragData))
  e.dataTransfer.effectAllowed = 'copyMove'

  uiStore.setDragging(true)
}

function handleDragEnd() {
  uiStore.setDragging(false)
}
</script>

<template>
  <div
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    class="mx-2 my-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md cursor-grab hover:border-blue-400 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 active:shadow-sm transition-all duration-200 ease-out group"
    :title="component.description"
  >
    <div class="flex items-center gap-2">
      <!-- Icon with hover animation -->
      <span class="text-base transition-transform duration-200 group-hover:scale-110">{{ component.icon }}</span>

      <!-- Name -->
      <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
        {{ component.name }}
      </span>

      <!-- Drag indicator with animation -->
      <svg
        class="w-4 h-4 ml-auto text-gray-300 dark:text-gray-600 group-hover:text-gray-400 transition-all duration-200 group-hover:translate-x-0.5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
      </svg>
    </div>
  </div>
</template>
