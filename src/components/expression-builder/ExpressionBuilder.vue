<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
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

const props = defineProps<{
  modelValue: string
  componentId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  close: []
}>()

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

      <!-- Expression textarea -->
      <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
