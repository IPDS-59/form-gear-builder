<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { BuilderComponent } from '@/types'
import { ComponentType, ClientMode } from '@/types'
import { useUIStore } from '@/stores/uiStore'
import HtmlContentEditor from './HtmlContentEditor.vue'

const props = defineProps<{
  component: BuilderComponent
}>()

const uiStore = useUIStore()

// HTML Editor modal state
const showHtmlEditor = ref(false)
const htmlEditorContent = ref('')

// Sync HTML editor content with component label
watch(() => props.component.label, (newVal) => {
  if (props.component.type === ComponentType.INNER_HTML) {
    htmlEditorContent.value = newVal || ''
  }
}, { immediate: true })

function openHtmlEditor() {
  htmlEditorContent.value = props.component.label || ''
  showHtmlEditor.value = true
}

function handleHtmlSave(content: string) {
  emit('update', 'label', content)
}

// Isolated HTML preview using iframe
const previewIframeRef = ref<HTMLIFrameElement | null>(null)

function updateInlinePreview() {
  if (!previewIframeRef.value) return
  const doc = previewIframeRef.value.contentDocument
  if (!doc) return

  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 0.5rem;
          line-height: 1.5;
          color: #374151;
          font-size: 0.875rem;
        }
        h1, h2, h3, h4, h5, h6 { margin-bottom: 0.25rem; color: #111827; }
        p { margin-bottom: 0.5rem; }
        ul, ol { margin-bottom: 0.5rem; padding-left: 1.25rem; }
        a { color: #2563eb; }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #e5e7eb; padding: 0.25rem; text-align: left; font-size: 0.75rem; }
        th { background: #f9fafb; }
      </style>
    </head>
    <body>${props.component.label || '<em style="color: #9ca3af;">No content</em>'}</body>
    </html>
  `)
  doc.close()
}

// Watch for label changes to update preview
watch(() => props.component.label, () => {
  if (props.component.type === ComponentType.INNER_HTML) {
    // Use nextTick-like delay for iframe
    setTimeout(updateInlinePreview, 0)
  }
})

const emit = defineEmits<{
  update: [key: string, value: unknown]
}>()

const isExpanded = ref(true)

// Check if component is a section or nested (has different properties)
const isContainer = computed(() =>
  props.component.type === ComponentType.SECTION ||
  props.component.type === ComponentType.NESTED
)

// Check if component is a variable
const isVariable = computed(() =>
  props.component.type === ComponentType.VARIABLE
)

// Check if component is an inner HTML
const isInnerHTML = computed(() =>
  props.component.type === ComponentType.INNER_HTML
)

function toggle() {
  isExpanded.value = !isExpanded.value
}

function handleInput(key: string, event: Event) {
  const target = event.target as HTMLInputElement
  emit('update', key, target.value)
}

function handleCheckbox(key: string, event: Event) {
  const target = event.target as HTMLInputElement
  emit('update', key, target.checked)
}

function handleSelect(key: string, event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value === '' ? undefined : Number(target.value)
  emit('update', key, value)
}

function handlePreviewClick() {
  window.setTimeout(updateInlinePreview, 50)
}
</script>

<template>
  <div class="p-3">
    <!-- Section header -->
    <button
      @click="toggle"
      class="w-full flex items-center gap-2 text-left"
    >
      <svg
        class="w-4 h-4 text-gray-500 transition-transform"
        :class="{ 'rotate-90': isExpanded }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Common Properties
      </span>
    </button>

    <!-- Properties form with transition -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 max-h-0 overflow-hidden"
      enter-to-class="opacity-100 max-h-[2000px]"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 max-h-[2000px]"
      leave-to-class="opacity-0 max-h-0 overflow-hidden"
    >
    <div v-if="isExpanded" class="mt-3 space-y-3">
      <!-- DataKey -->
      <div>
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          DataKey <span class="text-red-500">*</span>
        </label>
        <input
          :value="component.dataKey"
          @input="handleInput('dataKey', $event)"
          type="text"
          placeholder="unique_key"
          class="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>

      <!-- Label (HTML Content for Inner HTML type) -->
      <div>
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          {{ isInnerHTML ? 'HTML Content' : 'Label' }} <span class="text-red-500">*</span>
        </label>
        <!-- Textarea for INNER_HTML type -->
        <template v-if="isInnerHTML">
          <div class="space-y-2">
            <div class="relative">
              <textarea
                :value="component.label"
                @input="handleInput('label', $event)"
                placeholder="<div class='my-class'>Your HTML content here...</div>"
                rows="6"
                class="w-full px-2.5 py-1.5 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
            <!-- Full-screen editor button -->
            <button
              @click="openHtmlEditor"
              class="w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Open Full Editor
            </button>
            <!-- Preview using isolated iframe -->
            <details class="border border-gray-200 dark:border-gray-600 rounded-md">
              <summary
                class="px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                @click="handlePreviewClick"
              >
                Preview HTML
              </summary>
              <div class="border-t border-gray-200 dark:border-gray-600 bg-white">
                <iframe
                  ref="previewIframeRef"
                  class="w-full border-0"
                  style="height: 150px;"
                  title="HTML Preview"
                />
              </div>
            </details>
          </div>
        </template>
        <!-- Regular input for other types -->
        <input
          v-else
          :value="component.label"
          @input="handleInput('label', $event)"
          type="text"
          placeholder="Field Label"
          class="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>

      <!-- Description -->
      <div>
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Description
        </label>
        <textarea
          :value="component.description || ''"
          @input="handleInput('description', $event)"
          placeholder="Optional description..."
          rows="2"
          class="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <!-- Hint -->
      <div v-if="!isContainer">
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Hint
        </label>
        <input
          :value="component.hint || ''"
          @input="handleInput('hint', $event)"
          type="text"
          placeholder="Help text for users"
          class="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>

      <!-- Expression (for Variable type) -->
      <div v-if="isVariable">
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Expression
        </label>
        <div
          @click="uiStore.openExpressionBuilder(component._id, 'expression')"
          class="w-full px-2.5 py-1.5 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors min-h-18"
        >
          <span v-if="component.expression" class="whitespace-pre-wrap break-all">{{ component.expression }}</span>
          <span v-else class="text-gray-400 dark:text-gray-500">Click to build expression...</span>
        </div>
      </div>

      <!-- Source Question (for Nested type) -->
      <div v-if="component.type === ComponentType.NESTED">
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Source Question
        </label>
        <input
          :value="component.sourceQuestion || ''"
          @input="handleInput('sourceQuestion', $event)"
          type="text"
          placeholder="parent_field_datakey"
          class="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <p class="mt-1 text-xs text-gray-400">
          DataKey of the field that determines repeat count
        </p>
      </div>

      <!-- Checkboxes row -->
      <div class="flex flex-wrap gap-4" v-if="!isContainer && !isVariable">
        <!-- Required -->
        <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            :checked="component.required || false"
            @change="handleCheckbox('required', $event)"
            class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          >
          Required
        </label>

        <!-- Disable Input -->
        <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            :checked="component.disableInput || false"
            @change="handleCheckbox('disableInput', $event)"
            class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          >
          Disabled
        </label>

        <!-- Enable Remark -->
        <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            :checked="component.enableRemark || false"
            @change="handleCheckbox('enableRemark', $event)"
            class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          >
          Remark
        </label>
      </div>

      <!-- Client Mode -->
      <div v-if="!isVariable">
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Client Mode
        </label>
        <select
          :value="component.client ?? ''"
          @change="handleSelect('client', $event)"
          class="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All modes</option>
          <option :value="ClientMode.CAWI">CAWI (Web)</option>
          <option :value="ClientMode.CAPI">CAPI (Mobile)</option>
          <option :value="ClientMode.PAPI">PAPI (Paper)</option>
        </select>
      </div>

      <!-- Enable Condition -->
      <div v-if="!isVariable">
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Enable Condition
        </label>
        <div
          @click="uiStore.openExpressionBuilder(component._id, 'enableCondition')"
          class="w-full px-2.5 py-1.5 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors min-h-12"
        >
          <span v-if="component.enableCondition" class="whitespace-pre-wrap break-all">{{ component.enableCondition }}</span>
          <span v-else class="text-gray-400 dark:text-gray-500">Click to build condition...</span>
        </div>
      </div>
    </div>
    </Transition>

    <!-- HTML Content Editor Modal -->
    <HtmlContentEditor
      v-if="isInnerHTML"
      v-model="htmlEditorContent"
      v-model:visible="showHtmlEditor"
      @save="handleHtmlSave"
    />
  </div>
</template>
