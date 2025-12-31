<script setup lang="ts">
import { ref } from 'vue'
import { useUIStore } from '@/stores/uiStore'
import Toolbar from './Toolbar.vue'
import ComponentPalette from '@/components/palette/ComponentPalette.vue'
import FormCanvas from '@/components/canvas/FormCanvas.vue'
import PropertiesPanel from '@/components/properties/PropertiesPanel.vue'
import LivePreview from '@/components/preview/LivePreview.vue'
import Notification from './Notification.vue'

const uiStore = useUIStore()

// Resizing state
const isResizingLeft = ref(false)
const isResizingRight = ref(false)

function startResizeLeft() {
  isResizingLeft.value = true
  document.addEventListener('mousemove', handleResizeLeft)
  document.addEventListener('mouseup', stopResize)
}

function startResizeRight() {
  isResizingRight.value = true
  document.addEventListener('mousemove', handleResizeRight)
  document.addEventListener('mouseup', stopResize)
}

function handleResizeLeft(e: MouseEvent) {
  if (isResizingLeft.value) {
    uiStore.resizeLeftPanel(e.clientX)
  }
}

function handleResizeRight(e: MouseEvent) {
  if (isResizingRight.value) {
    uiStore.resizeRightPanel(window.innerWidth - e.clientX)
  }
}

function stopResize() {
  isResizingLeft.value = false
  isResizingRight.value = false
  document.removeEventListener('mousemove', handleResizeLeft)
  document.removeEventListener('mousemove', handleResizeRight)
  document.removeEventListener('mouseup', stopResize)
}
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
    <!-- Toolbar -->
    <Toolbar />

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel: Component Palette -->
      <aside
        v-if="!uiStore.panels.leftCollapsed && !uiStore.previewMode"
        :style="{ width: `${uiStore.panels.leftWidth}px` }"
        class="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0"
      >
        <ComponentPalette />
      </aside>

      <!-- Left Resize Handle -->
      <div
        v-if="!uiStore.panels.leftCollapsed && !uiStore.previewMode"
        class="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 cursor-col-resize shrink-0"
        @mousedown="startResizeLeft"
      />

      <!-- Left Collapse Button -->
      <button
        v-if="!uiStore.previewMode"
        @click="uiStore.toggleLeftPanel"
        class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-5 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700"
        :style="{ left: uiStore.panels.leftCollapsed ? '0' : `${uiStore.panels.leftWidth + 4}px` }"
      >
        <svg
          class="w-4 h-4 text-gray-500"
          :class="{ 'rotate-180': uiStore.panels.leftCollapsed }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Center: Canvas or Preview -->
      <main class="flex-1 overflow-auto">
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
          mode="out-in"
        >
          <LivePreview v-if="uiStore.previewMode" key="preview" />
          <FormCanvas v-else key="canvas" />
        </Transition>
      </main>

      <!-- Right Collapse Button -->
      <button
        v-if="!uiStore.previewMode"
        @click="uiStore.toggleRightPanel"
        class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-5 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700"
        :style="{ right: uiStore.panels.rightCollapsed ? '0' : `${uiStore.panels.rightWidth + 4}px` }"
      >
        <svg
          class="w-4 h-4 text-gray-500"
          :class="{ 'rotate-180': !uiStore.panels.rightCollapsed }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Right Resize Handle -->
      <div
        v-if="!uiStore.panels.rightCollapsed && !uiStore.previewMode"
        class="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 cursor-col-resize shrink-0"
        @mousedown="startResizeRight"
      />

      <!-- Right Panel: Properties -->
      <aside
        v-if="!uiStore.panels.rightCollapsed && !uiStore.previewMode"
        :style="{ width: `${uiStore.panels.rightWidth}px` }"
        class="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col shrink-0"
      >
        <PropertiesPanel />
      </aside>
    </div>

    <!-- Notification -->
    <Notification />
  </div>
</template>
