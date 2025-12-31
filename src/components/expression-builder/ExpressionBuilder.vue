<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTemplateStore } from '@/stores/templateStore'
import { useUIStore } from '@/stores/uiStore'
import FieldPicker from './FieldPicker.vue'
import FunctionPicker from './FunctionPicker.vue'
import OperatorButtons from './OperatorButtons.vue'

const props = defineProps<{
  modelValue: string
  componentId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  close: []
}>()

const templateStore = useTemplateStore()
const uiStore = useUIStore()

// Local expression value
const expression = ref(props.modelValue)

// Sync with prop changes
watch(() => props.modelValue, (newVal) => {
  expression.value = newVal
})

// Textarea ref for cursor position
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// Insert text at cursor position
function insertAtCursor(text: string) {
  const textarea = textareaRef.value
  if (!textarea) {
    expression.value += text
    return
  }

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = expression.value.substring(0, start)
  const after = expression.value.substring(end)

  expression.value = before + text + after

  // Set cursor position after inserted text
  nextTick(() => {
    textarea.focus()
    const newPos = start + text.length
    textarea.setSelectionRange(newPos, newPos)
  })
}

// Import nextTick
import { nextTick } from 'vue'

// Handle field selection
function handleFieldSelect(dataKey: string) {
  insertAtCursor(`getValue('${dataKey}')`)
}

// Handle function selection
function handleFunctionSelect(func: string) {
  insertAtCursor(func)
}

// Handle operator click
function handleOperatorClick(operator: string) {
  insertAtCursor(` ${operator} `)
}

// Handle value insert
function handleValueInsert(value: string) {
  insertAtCursor(value)
}

// Apply the expression
function apply() {
  emit('update:modelValue', expression.value)
  emit('close')
}

// Cancel
function cancel() {
  emit('close')
}

// Validate expression (basic check)
const isValid = computed(() => {
  if (!expression.value.trim()) return true

  try {
    // Basic syntax check - try to parse as function body
    new Function('getValue', 'getRowIndex', 'getProp', expression.value)
    return true
  } catch {
    return false
  }
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[800px] max-h-[80vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Expression Builder
        </h2>
        <button
          @click="cancel"
          class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Expression textarea -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Expression
        </label>
        <textarea
          ref="textareaRef"
          v-model="expression"
          rows="4"
          class="w-full px-3 py-2 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="[
            isValid
              ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100'
          ]"
          placeholder="getValue('field_name') == 'value'"
        />
        <p v-if="!isValid" class="mt-1 text-sm text-red-600 dark:text-red-400">
          Invalid expression syntax
        </p>
      </div>

      <!-- Builder tools -->
      <div class="flex-1 overflow-hidden flex">
        <!-- Fields -->
        <div class="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <FieldPicker
            :component-id="componentId"
            @select="handleFieldSelect"
          />
        </div>

        <!-- Functions and Operators -->
        <div class="w-2/3 overflow-y-auto p-4">
          <FunctionPicker @select="handleFunctionSelect" />

          <div class="mt-4">
            <OperatorButtons
              @operator="handleOperatorClick"
              @value="handleValueInsert"
            />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="cancel"
          class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          Cancel
        </button>
        <button
          @click="apply"
          :disabled="!isValid"
          class="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
</template>
