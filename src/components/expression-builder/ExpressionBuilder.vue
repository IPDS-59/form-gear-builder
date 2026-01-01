<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import FieldPicker from './FieldPicker.vue'
import FunctionPicker from './FunctionPicker.vue'
import OperatorButtons from './OperatorButtons.vue'

// Register JavaScript language
hljs.registerLanguage('javascript', javascript)

const props = defineProps<{
  modelValue: string
  componentId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  close: []
}>()

// Local expression value
const expression = ref('')

// Refs
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const highlightRef = ref<HTMLPreElement | null>(null)

// Format JavaScript expression for editing
function formatExpression(code: string): string {
  if (!code || !code.trim()) return code

  let formatted = code.trim()

  // Add spaces around operators if not already present
  formatted = formatted
    // Logical operators
    .replace(/\s*&&\s*/g, ' && ')
    .replace(/\s*\|\|\s*/g, ' || ')
    // Comparison operators (be careful not to break !== and ===)
    .replace(/\s*===\s*/g, ' === ')
    .replace(/\s*!==\s*/g, ' !== ')
    .replace(/\s*==\s*/g, ' == ')
    .replace(/\s*!=\s*/g, ' != ')
    .replace(/\s*>=\s*/g, ' >= ')
    .replace(/\s*<=\s*/g, ' <= ')
    .replace(/(?<![<>=!])>\s*/g, ' > ')
    .replace(/\s*<(?![=])/g, ' < ')
    // Ternary
    .replace(/\s*\?\s*/g, ' ? ')
    .replace(/\s*:\s*/g, ' : ')
    // Clean up multiple spaces
    .replace(/\s{2,}/g, ' ')
    .trim()

  return formatted
}

// Minify expression for storage
function minifyExpression(code: string): string {
  if (!code || !code.trim()) return code

  return code
    // Remove excessive whitespace but keep single spaces where needed
    .replace(/\s+/g, ' ')
    // Remove spaces around operators (carefully)
    .replace(/\s*&&\s*/g, '&&')
    .replace(/\s*\|\|\s*/g, '||')
    .replace(/\s*===\s*/g, '===')
    .replace(/\s*!==\s*/g, '!==')
    .replace(/\s*==\s*/g, '==')
    .replace(/\s*!=\s*/g, '!=')
    .replace(/\s*>=\s*/g, '>=')
    .replace(/\s*<=\s*/g, '<=')
    .replace(/\s*>\s*/g, '>')
    .replace(/\s*<\s*/g, '<')
    .replace(/\s*\?\s*/g, '?')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*,\s*/g, ',')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim()
}

// Syntax highlighting using highlight.js
function highlightCode(code: string): string {
  if (!code) return ''

  try {
    const result = hljs.highlight(code, { language: 'javascript' })
    return result.value
  } catch {
    // Fallback: escape HTML
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }
}

// Computed highlighted content
const highlightedContent = computed(() => highlightCode(expression.value))

// Sync scroll between textarea and highlight overlay
function syncScroll() {
  if (textareaRef.value && highlightRef.value) {
    highlightRef.value.scrollTop = textareaRef.value.scrollTop
    highlightRef.value.scrollLeft = textareaRef.value.scrollLeft
  }
}

// Format button handler
function formatCode() {
  expression.value = formatExpression(expression.value)
}

// Sync with prop changes - format when opening
watch(() => props.modelValue, (newVal) => {
  expression.value = formatExpression(newVal)
}, { immediate: true })

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

// Apply the expression - minify before saving
function apply() {
  const minified = minifyExpression(expression.value)
  emit('update:modelValue', minified)
  emit('close')
}

// Handle dialog open state change
function handleOpenChange(open: boolean) {
  if (!open) {
    emit('close')
  }
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
  <Dialog :open="true" @update:open="handleOpenChange">
    <DialogContent
      class="sm:max-w-4xl max-h-[80vh] flex flex-col p-0 gap-0 bg-white dark:bg-gray-800"
      :show-close-button="true"
    >
      <DialogHeader class="p-4 pb-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <DialogTitle>Expression Builder</DialogTitle>
        <DialogDescription>
          Build expressions using field values, operators, and functions.
        </DialogDescription>
      </DialogHeader>

      <!-- Expression editor with syntax highlighting -->
      <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Expression
          </label>
          <button
            @click="formatCode"
            class="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors flex items-center gap-1 border border-blue-200 dark:border-blue-700"
            title="Format expression"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            Format
          </button>
        </div>
        <div class="relative">
          <!-- Syntax highlighted overlay -->
          <pre
            ref="highlightRef"
            class="absolute inset-0 px-3 py-2 font-mono text-sm rounded-lg overflow-auto pointer-events-none whitespace-pre-wrap wrap-break-word m-0 border"
            :class="[
              isValid
                ? 'border-gray-300 dark:border-gray-600 bg-gray-900'
                : 'border-red-500 bg-red-900/20'
            ]"
            aria-hidden="true"
            v-html="highlightedContent + '\n'"
          ></pre>
          <!-- Transparent textarea for input -->
          <textarea
            ref="textareaRef"
            v-model="expression"
            @scroll="syncScroll"
            rows="4"
            class="expression-textarea relative w-full px-3 py-2 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-transparent caret-white resize-none z-10"
            :class="[
              isValid
                ? 'border-gray-300 dark:border-gray-600'
                : 'border-red-500'
            ]"
            placeholder="getValue('field_name') == 'value'"
            spellcheck="false"
          />
          <!-- Placeholder when empty -->
          <div
            v-if="!expression"
            class="absolute top-2 left-3 text-gray-500 font-mono text-sm pointer-events-none"
          >
            getValue('field_name') == 'value'
          </div>
        </div>
        <p v-if="!isValid" class="mt-1 text-sm text-red-600 dark:text-red-400">
          Invalid expression syntax
        </p>
      </div>

      <!-- Builder tools -->
      <div class="flex-1 overflow-hidden flex min-h-64 bg-white dark:bg-gray-800">
        <!-- Fields -->
        <div class="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-700/50">
          <FieldPicker
            :component-id="componentId"
            @select="handleFieldSelect"
          />
        </div>

        <!-- Functions and Operators -->
        <div class="w-2/3 overflow-y-auto p-4 bg-white dark:bg-gray-800">
          <FunctionPicker @select="handleFunctionSelect" />

          <div class="mt-4">
            <OperatorButtons
              @operator="handleOperatorClick"
              @value="handleValueInsert"
            />
          </div>
        </div>
      </div>

      <DialogFooter class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <Button variant="outline" @click="emit('close')">
          Cancel
        </Button>
        <Button @click="apply" :disabled="!isValid">
          Apply
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* highlight.js theme - VS Code Dark+ inspired */
:deep(.hljs-keyword) {
  color: #569cd6;
}

:deep(.hljs-string) {
  color: #ce9178;
}

:deep(.hljs-number) {
  color: #b5cea8;
}

:deep(.hljs-built_in) {
  color: #4ec9b0;
}

:deep(.hljs-function) {
  color: #dcdcaa;
}

:deep(.hljs-params) {
  color: #9cdcfe;
}

:deep(.hljs-comment) {
  color: #6a9955;
  font-style: italic;
}

:deep(.hljs-operator) {
  color: #d4d4d4;
}

:deep(.hljs-punctuation) {
  color: #d4d4d4;
}

:deep(.hljs-literal) {
  color: #569cd6;
}

/* Ensure pre and textarea have matching styles */
.expression-textarea,
pre {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  tab-size: 2;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Base text color for highlighted code */
pre {
  color: #d4d4d4;
}
</style>
