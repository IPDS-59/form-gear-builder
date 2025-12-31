<script setup lang="ts">
import { ref } from 'vue'
import { useTemplateStore } from '@/stores/templateStore'
import { useValidationStore } from '@/stores/validationStore'
import { useUIStore } from '@/stores/uiStore'
import { downloadJSON, exportTemplateJSON, exportValidationJSON, parseJSONFile, validateTemplateJSON, validateValidationJSON } from '@/utils/jsonExporter'
import type { TemplateState, ValidationState } from '@/types'

const templateStore = useTemplateStore()
const validationStore = useValidationStore()
const uiStore = useUIStore()

// File input refs
const templateInput = ref<HTMLInputElement | null>(null)
const validationInput = ref<HTMLInputElement | null>(null)

// Export template
function exportTemplate() {
  const template = templateStore.toTemplateJSON()
  downloadJSON(exportTemplateJSON(template), `${template.dataKey}_template.json`)
  uiStore.showNotification('Template exported', 'success')
}

// Export validation
function exportValidation() {
  const validation = validationStore.toValidationJSON()
  downloadJSON(exportValidationJSON(validation), `${validation.dataKey}_validation.json`)
  uiStore.showNotification('Validation exported', 'success')
}

// Export both
function exportAll() {
  exportTemplate()
  setTimeout(exportValidation, 100)
}

// Import template
async function handleTemplateImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const data = await parseJSONFile<TemplateState>(file)
    if (!validateTemplateJSON(data)) {
      throw new Error('Invalid template structure')
    }
    templateStore.fromTemplateJSON(data)
    uiStore.showNotification('Template imported', 'success')
  } catch (error) {
    uiStore.showNotification('Failed to import template', 'error')
  }

  // Reset input
  if (templateInput.value) templateInput.value.value = ''
}

// Import validation
async function handleValidationImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const data = await parseJSONFile<ValidationState>(file)
    if (!validateValidationJSON(data)) {
      throw new Error('Invalid validation structure')
    }
    validationStore.fromValidationJSON(data)
    uiStore.showNotification('Validation imported', 'success')
  } catch (error) {
    uiStore.showNotification('Failed to import validation', 'error')
  }

  // Reset input
  if (validationInput.value) validationInput.value.value = ''
}

// Clear form
function clearForm() {
  if (confirm('Are you sure you want to clear the form? All changes will be lost.')) {
    templateStore.clear()
    validationStore.clear()
    uiStore.clearHistory()
    uiStore.showNotification('Form cleared', 'info')
  }
}

// Undo/Redo
function handleUndo() {
  const state = uiStore.undo()
  if (state) {
    const parsed = JSON.parse(state)
    templateStore.fromTemplateJSON(parsed.template)
    validationStore.fromValidationJSON(parsed.validation)
  }
}

function handleRedo() {
  const state = uiStore.redo()
  if (state) {
    const parsed = JSON.parse(state)
    templateStore.fromTemplateJSON(parsed.template)
    validationStore.fromValidationJSON(parsed.validation)
  }
}
</script>

<template>
  <header class="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 flex items-center justify-between shrink-0">
    <!-- Left: Logo and Title -->
    <div class="flex items-center gap-2 sm:gap-3">
      <img src="/FormGear.png" alt="FormGear" class="w-7 h-7 sm:w-8 sm:h-8" />
      <div class="hidden sm:block">
        <h1 class="text-sm font-semibold text-gray-900 dark:text-white">FormGear Builder</h1>
        <p class="text-xs text-gray-500 dark:text-gray-400">Template Designer</p>
      </div>
    </div>

    <!-- Center: Actions -->
    <div class="flex items-center gap-1 sm:gap-2">
      <!-- Import - Hidden in preview mode -->
      <div v-if="!uiStore.previewMode" class="relative group">
        <button
          class="p-1.5 sm:px-3 sm:py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-1.5"
          title="Import"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span class="hidden md:inline">Import</span>
          <svg class="w-3 h-3 ml-0.5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <!-- Invisible bridge to prevent gap -->
        <div class="absolute left-0 top-full h-1 w-48 hidden group-hover:block"></div>
        <div class="absolute left-0 top-full pt-1 w-48 hidden group-hover:block z-50">
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden">
            <button
              @click="templateInput?.click()"
              class="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Import Template
            </button>
            <button
              @click="validationInput?.click()"
              class="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Import Validation
            </button>
          </div>
        </div>
      </div>

      <!-- Export - Hidden in preview mode -->
      <div v-if="!uiStore.previewMode" class="relative group">
        <button
          class="p-1.5 sm:px-3 sm:py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-1.5"
          title="Export"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span class="hidden md:inline">Export</span>
          <svg class="w-3 h-3 ml-0.5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <!-- Invisible bridge to prevent gap -->
        <div class="absolute left-0 top-full h-1 w-48 hidden group-hover:block"></div>
        <div class="absolute left-0 top-full pt-1 w-48 hidden group-hover:block z-50">
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden">
            <button
              @click="exportTemplate"
              class="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Export Template
            </button>
            <button
              @click="exportValidation"
              class="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Export Validation
            </button>
            <button
              @click="exportAll"
              class="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700"
            >
              Export All
            </button>
          </div>
        </div>
      </div>

      <!-- Divider - Hidden in preview mode -->
      <div v-if="!uiStore.previewMode" class="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden sm:block" />

      <!-- Undo/Redo - Hidden in preview mode -->
      <template v-if="!uiStore.previewMode">
        <button
          @click="handleUndo"
          :disabled="!uiStore.canUndo"
          class="p-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          @click="handleRedo"
          :disabled="!uiStore.canRedo"
          class="p-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Shift+Z)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>

        <div class="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
      </template>

      <!-- Preview -->
      <button
        @click="uiStore.togglePreview"
        :class="[
          'px-2 py-1.5 sm:px-3 text-sm rounded-md flex items-center gap-1.5',
          uiStore.previewMode
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span class="hidden sm:inline">{{ uiStore.previewMode ? 'Exit Preview' : 'Preview' }}</span>
      </button>

      <!-- Clear - Hidden in preview mode -->
      <button
        v-if="!uiStore.previewMode"
        @click="clearForm"
        class="p-1.5 sm:px-3 sm:py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md flex items-center gap-1.5"
        title="Clear"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span class="hidden md:inline">Clear</span>
      </button>
    </div>

    <!-- Right: Settings -->
    <div class="flex items-center gap-1 sm:gap-2">
      <button
        @click="uiStore.toggleDarkMode"
        class="p-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
        title="Toggle Dark Mode"
      >
        <svg v-if="uiStore.darkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
    </div>

    <!-- Hidden file inputs -->
    <input
      ref="templateInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="handleTemplateImport"
    />
    <input
      ref="validationInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="handleValidationImport"
    />
  </header>
</template>
