<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/uiStore'
import Toolbar from './Toolbar.vue'
import ComponentPalette from '@/components/palette/ComponentPalette.vue'
import FormCanvas from '@/components/canvas/FormCanvas.vue'
import PropertiesPanel from '@/components/properties/PropertiesPanel.vue'
import LivePreview from '@/components/preview/LivePreview.vue'
import Notification from './Notification.vue'

const uiStore = useUIStore()

// Responsive breakpoints
const isMobile = ref(false)
const isTablet = ref(false)

function checkScreenSize() {
  isMobile.value = window.innerWidth < 640 // sm breakpoint
  isTablet.value = window.innerWidth < 1024 // lg breakpoint
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// Mobile panel state (overlay mode)
const mobilePanel = ref<'palette' | 'properties' | null>(null)

function toggleMobilePanel(panel: 'palette' | 'properties') {
  mobilePanel.value = mobilePanel.value === panel ? null : panel
}


// Computed panel widths for responsive design
const leftPanelWidth = computed(() => {
  if (isMobile.value) return '100%'
  if (isTablet.value) return '200px'
  return `${uiStore.panels.leftWidth}px`
})

const rightPanelWidth = computed(() => {
  if (isMobile.value) return '100%'
  if (isTablet.value) return '280px'
  return `${uiStore.panels.rightWidth}px`
})

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
    <div class="flex-1 flex overflow-hidden relative">
      <!-- Mobile Bottom Bar (visible on mobile when not in preview) -->
      <div
        v-if="isMobile && !uiStore.previewMode"
        class="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around py-2 px-4"
      >
        <button
          @click="toggleMobilePanel('palette')"
          :class="[
            'flex flex-col items-center gap-1 px-4 py-2 rounded-lg',
            mobilePanel === 'palette' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'text-gray-600 dark:text-gray-400'
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span class="text-xs">Components</span>
        </button>
        <button
          @click="toggleMobilePanel('properties')"
          :class="[
            'flex flex-col items-center gap-1 px-4 py-2 rounded-lg',
            mobilePanel === 'properties' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'text-gray-600 dark:text-gray-400'
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span class="text-xs">Properties</span>
        </button>
      </div>

      <!-- Mobile Panel Overlay -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isMobile && mobilePanel && !uiStore.previewMode"
          class="fixed inset-0 bg-black/50 z-30"
          @click="mobilePanel = null"
        />
      </Transition>

      <!-- Mobile Palette Slide-up -->
      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="translate-y-full"
        enter-to-class="translate-y-0"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-from-class="translate-y-0"
        leave-to-class="translate-y-full"
      >
        <aside
          v-if="isMobile && mobilePanel === 'palette' && !uiStore.previewMode"
          class="fixed bottom-14 left-0 right-0 h-[60vh] bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 rounded-t-xl overflow-hidden flex flex-col"
        >
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 class="font-medium text-gray-900 dark:text-white">Components</h2>
            <button @click="mobilePanel = null" class="p-1 text-gray-500 hover:text-gray-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-auto">
            <ComponentPalette @component-selected="mobilePanel = null" />
          </div>
        </aside>
      </Transition>

      <!-- Mobile Properties Slide-up -->
      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="translate-y-full"
        enter-to-class="translate-y-0"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-from-class="translate-y-0"
        leave-to-class="translate-y-full"
      >
        <aside
          v-if="isMobile && mobilePanel === 'properties' && !uiStore.previewMode"
          class="fixed bottom-14 left-0 right-0 h-[70vh] bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 rounded-t-xl overflow-hidden flex flex-col"
        >
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 class="font-medium text-gray-900 dark:text-white">Properties</h2>
            <button @click="mobilePanel = null" class="p-1 text-gray-500 hover:text-gray-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-auto">
            <PropertiesPanel />
          </div>
        </aside>
      </Transition>

      <!-- Desktop Left Panel: Component Palette -->
      <aside
        v-if="!isMobile && !uiStore.panels.leftCollapsed && !uiStore.previewMode"
        :style="{ width: leftPanelWidth }"
        class="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0"
      >
        <ComponentPalette />
      </aside>

      <!-- Left Resize Handle (desktop only) -->
      <div
        v-if="!isMobile && !isTablet && !uiStore.panels.leftCollapsed && !uiStore.previewMode"
        class="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 cursor-col-resize shrink-0"
        @mousedown="startResizeLeft"
      />

      <!-- Left Collapse Button (desktop only) -->
      <button
        v-if="!isMobile && !uiStore.previewMode"
        @click="uiStore.toggleLeftPanel"
        class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-5 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700"
        :style="{ left: uiStore.panels.leftCollapsed ? '0' : isTablet ? '204px' : `${uiStore.panels.leftWidth + 4}px` }"
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
      <main :class="['flex-1 overflow-auto', isMobile && !uiStore.previewMode ? 'pb-16' : '']">
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

      <!-- Right Collapse Button (desktop only) -->
      <button
        v-if="!isMobile && !uiStore.previewMode"
        @click="uiStore.toggleRightPanel"
        class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-5 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700"
        :style="{ right: uiStore.panels.rightCollapsed ? '0' : isTablet ? '284px' : `${uiStore.panels.rightWidth + 4}px` }"
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

      <!-- Right Resize Handle (desktop only) -->
      <div
        v-if="!isMobile && !isTablet && !uiStore.panels.rightCollapsed && !uiStore.previewMode"
        class="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 cursor-col-resize shrink-0"
        @mousedown="startResizeRight"
      />

      <!-- Desktop Right Panel: Properties -->
      <aside
        v-if="!isMobile && !uiStore.panels.rightCollapsed && !uiStore.previewMode"
        :style="{ width: rightPanelWidth }"
        class="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col shrink-0"
      >
        <PropertiesPanel />
      </aside>
    </div>

    <!-- Cancel Pending Component Button (mobile) -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <button
        v-if="uiStore.hasPendingComponent"
        @click="uiStore.clearPendingComponent"
        class="fixed bottom-20 right-4 z-50 px-4 py-2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-700 dark:hover:bg-gray-300"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span class="text-sm font-medium">Cancel</span>
      </button>
    </Transition>

    <!-- Notification -->
    <Notification />
  </div>
</template>
