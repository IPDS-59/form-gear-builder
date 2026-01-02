<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTemplateStore } from '@/stores/templateStore'
import { useValidationStore } from '@/stores/validationStore'
import { useUIStore } from '@/stores/uiStore'

const templateStore = useTemplateStore()
const validationStore = useValidationStore()
const uiStore = useUIStore()

const iframeRef = ref<HTMLIFrameElement | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

// Generate the template and validation JSON
const templateJSON = computed(() => templateStore.toTemplateJSON())
const validationJSON = computed(() => validationStore.toValidationJSON())

// Debounced update for preview
let updateTimeout: ReturnType<typeof setTimeout> | null = null

function updatePreview() {
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }

  updateTimeout = setTimeout(() => {
    sendDataToIframe()
  }, 500)
}

// Watch for changes and update preview
watch([templateJSON, validationJSON], () => {
  if (uiStore.previewMode) {
    updatePreview()
  }
}, { deep: true })

// Send data to iframe
function sendDataToIframe() {
  if (!iframeRef.value?.contentWindow) return

  try {
    // Deep clone to strip Vue reactivity (Proxy objects can't be cloned by postMessage)
    const data = JSON.parse(JSON.stringify({
      type: 'formgear-preview',
      template: templateJSON.value,
      validation: validationJSON.value,
    }))

    iframeRef.value.contentWindow.postMessage(data, '*')
    error.value = null
  } catch (err) {
    error.value = 'Failed to update preview'
    console.error('Preview update error:', err)
  }
}

function handleIframeLoad() {
  isLoading.value = false
  // Send initial data after iframe loads
  setTimeout(sendDataToIframe, 100)
}

function handleIframeError() {
  isLoading.value = false
  error.value = 'Failed to load preview'
}

// Listen for messages from iframe
function handleMessage(event: MessageEvent) {
  if (event.data?.type === 'formgear-ready') {
    sendDataToIframe()
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }
})

// Refresh preview
function refreshPreview() {
  isLoading.value = true
  error.value = null
  if (iframeRef.value) {
    iframeRef.value.src = iframeRef.value.src
  }
}

// Close preview
function closePreview() {
  uiStore.togglePreview()
}
</script>

<template>
  <div class="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
    <!-- Preview Header -->
    <div class="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-200">
          Live Preview
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          (powered by FormGear Engine)
        </span>
      </div>

      <div class="flex items-center gap-2">
        <!-- Refresh button -->
        <button
          @click="refreshPreview"
          class="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Refresh Preview"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <!-- Close button -->
        <button
          @click="closePreview"
          class="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Close Preview"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Preview Content -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Loading state -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isLoading"
          class="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 z-10"
        >
          <div class="text-center">
            <svg class="w-8 h-8 mx-auto mb-2 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-sm text-gray-500 dark:text-gray-400">Loading FormGear preview...</p>
          </div>
        </div>
      </Transition>

      <!-- Error state -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="error && !isLoading"
          class="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 z-10"
        >
          <div class="text-center">
            <svg class="w-12 h-12 mx-auto mb-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="text-sm text-red-600 dark:text-red-400 mb-2">{{ error }}</p>
            <button
              @click="refreshPreview"
              class="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </Transition>

      <!-- Empty template state -->
      <div
        v-if="!templateJSON.components?.length && !isLoading"
        class="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 z-10"
      >
        <div class="text-center">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">No components in template</p>
          <p class="text-xs text-gray-400 dark:text-gray-500">Add components to see the preview</p>
        </div>
      </div>

      <!-- FormGear iframe -->
      <iframe
        ref="iframeRef"
        src="/preview.html"
        class="w-full h-full border-0"
        @load="handleIframeLoad"
        @error="handleIframeError"
        title="FormGear Preview"
        tabindex="-1"
      />
    </div>

    <!-- Preview Info Bar -->
    <div class="flex items-center justify-between px-4 py-1.5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
      <span>
        Components: {{ templateStore.components.length }} |
        Validation Rules: {{ validationStore.testFunctions.length }}
      </span>
      <span>
        FormGear Engine v2.0
      </span>
    </div>
  </div>
</template>
