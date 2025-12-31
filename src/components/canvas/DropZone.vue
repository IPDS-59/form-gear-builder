<script setup lang="ts">
import { ref } from 'vue'
import { useTemplateStore } from '@/stores/templateStore'
import { useUIStore } from '@/stores/uiStore'
import { createDefaultComponent } from '@/utils/componentDefaults'
import type { ComponentType } from '@/types'

const props = defineProps<{
  position: 'before' | 'after' | 'end'
  index: number
  parentId?: string
}>()

const templateStore = useTemplateStore()
const uiStore = useUIStore()

const isOver = ref(false)

// Check if this drop zone should be disabled (when dragging a component into itself or its descendants)
function isDropDisabled(): boolean {
  const draggedId = uiStore.dragState.draggedId
  if (!draggedId) return false

  // If dropping into the dragged component itself (as a child)
  if (props.parentId === draggedId) return true

  // Check if the parentId is a descendant of the dragged component
  // This prevents dropping a component into its own children
  if (props.parentId) {
    const draggedComponent = templateStore.getComponent(draggedId)
    if (draggedComponent) {
      // Walk up from parentId to see if we encounter the dragged component
      let current = templateStore.getComponent(props.parentId)
      while (current) {
        if (current._id === draggedId) return true
        current = current._parent ? templateStore.getComponent(current._parent) : undefined
      }
    }
  }

  return false
}

function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  if (isDropDisabled()) return
  isOver.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  // Only set to false if we're leaving the drop zone entirely
  const relatedTarget = e.relatedTarget as HTMLElement
  if (!relatedTarget || !e.currentTarget || !(e.currentTarget as HTMLElement).contains(relatedTarget)) {
    isOver.value = false
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (isDropDisabled()) {
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'none'
    }
    return
  }
  if (e.dataTransfer) {
    // Allow both copy (new component) and move (existing component)
    e.dataTransfer.dropEffect = 'move'
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isOver.value = false

  if (isDropDisabled()) return
  if (!e.dataTransfer) return

  const rawData = e.dataTransfer.getData('application/json')
  if (!rawData) return

  try {
    const data = JSON.parse(rawData)
    const originalParentId = data.originalParentId

    if (data.type === 'new-component') {
      // Create new component from palette
      const newComponent = createDefaultComponent(
        data.componentType as ComponentType,
        props.parentId
      )

      // Apply any default props
      if (data.defaultProps) {
        Object.assign(newComponent, data.defaultProps)
      }

      // Add to template at specified index
      templateStore.addComponent(newComponent, props.index, props.parentId)

      // Select the new component
      uiStore.selectComponent(newComponent._id)

      uiStore.showNotification('Component added', 'success')
    } else if (data.type === 'move-component') {
      // Move existing component - parameters: (id, newParentId, newIndex)
      templateStore.moveComponent(data.componentId, props.parentId, props.index)

      // Show appropriate notification
      if (originalParentId === props.parentId) {
        uiStore.showNotification('Component reordered', 'success')
      } else {
        uiStore.showNotification('Component moved', 'success')
      }
    }
  } catch {
    uiStore.showNotification('Failed to add component', 'error')
  }
}
</script>

<template>
  <div
    data-dropzone="true"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
    class="relative transition-all duration-300 ease-out transform border-2 border-dashed rounded-lg"
    :class="[
      isOver
        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 min-h-16'
        : uiStore.isDragging
          ? 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800/50 min-h-12'
          : position === 'end' && !parentId
            ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
            : 'border-transparent min-h-2',
    ]"
  >
    <!-- Drop indicator with animation -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-90"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-90"
    >
      <div
        v-if="isOver"
        class="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span class="text-sm text-blue-600 dark:text-blue-400 font-medium">
            Drop here
          </span>
        </div>
      </div>
    </Transition>

    <!-- Placeholder for empty container drop zone -->
    <div
      v-if="!isOver && parentId && uiStore.isDragging && position === 'end'"
      class="absolute inset-0 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 pointer-events-none"
    >
      Drop components here
    </div>

    <!-- Empty canvas state -->
    <div
      v-if="!isOver && !parentId && position === 'end'"
      class="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          No components yet
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Drag components from the palette to start building your form
        </p>
      </div>
    </div>
  </div>
</template>
