<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BuilderComponent, ValidationRule } from '@/types'
import { ValidationType } from '@/types'
import { useValidationStore } from '@/stores/validationStore'
import { useUIStore } from '@/stores/uiStore'

const props = defineProps<{
  component: BuilderComponent
}>()

const emit = defineEmits<{
  update: [key: string, value: unknown]
}>()

const validationStore = useValidationStore()
const uiStore = useUIStore()
const isExpanded = ref(true)

// Get validation rules for this component
const rules = computed(() => {
  const testFn = validationStore.testFunctions.find(
    tf => tf.dataKey === props.component.dataKey
  )
  return testFn?.validations ?? []
})

function toggle() {
  isExpanded.value = !isExpanded.value
}

function addRule() {
  validationStore.addValidationRule(props.component.dataKey, {
    test: `getValue('${props.component.dataKey}') == ''`,
    message: 'This field is required',
    type: ValidationType.REQUIRED
  })
}

function updateRule(index: number, field: keyof ValidationRule, value: unknown) {
  validationStore.updateValidationRule(props.component.dataKey, index, field, value)
}

function removeRule(index: number) {
  validationStore.removeValidationRule(props.component.dataKey, index)
}

function getTypeLabel(type: ValidationType): string {
  switch (type) {
    case ValidationType.REQUIRED: return 'Required'
    case ValidationType.ERROR: return 'Error'
    case ValidationType.WARNING: return 'Warning'
    default: return 'Unknown'
  }
}

function getTypeColor(type: ValidationType): string {
  switch (type) {
    case ValidationType.REQUIRED: return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    case ValidationType.ERROR: return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
    case ValidationType.WARNING: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
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
        Validation Rules
      </span>
      <span class="ml-auto text-xs text-gray-400">
        {{ rules.length }} rules
      </span>
    </button>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 max-h-0 overflow-hidden"
      enter-to-class="opacity-100 max-h-[2000px]"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 max-h-[2000px]"
      leave-to-class="opacity-0 max-h-0 overflow-hidden"
    >
    <div v-if="isExpanded" class="mt-3 space-y-3">
      <!-- Rules list with TransitionGroup -->
      <TransitionGroup
        tag="div"
        class="space-y-3"
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in absolute w-full"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95 -translate-x-4"
        move-class="transition-transform duration-200"
      >
      <div
        v-for="(rule, index) in rules"
        :key="`rule-${index}`"
        class="p-3 bg-gray-50 dark:bg-gray-800 rounded-md space-y-2"
      >
        <!-- Rule header -->
        <div class="flex items-center gap-2">
          <span :class="['text-xs px-2 py-0.5 rounded', getTypeColor(rule.type)]">
            {{ getTypeLabel(rule.type) }}
          </span>
          <span class="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
            Rule {{ index + 1 }}
          </span>
          <button
            @click="removeRule(index)"
            class="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-gray-400 hover:text-red-500"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Type selector -->
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Type</label>
          <select
            :value="rule.type"
            @change="updateRule(index, 'type', Number(($event.target as HTMLSelectElement).value))"
            class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option :value="ValidationType.REQUIRED">Required</option>
            <option :value="ValidationType.ERROR">Error</option>
            <option :value="ValidationType.WARNING">Warning</option>
          </select>
        </div>

        <!-- Test expression -->
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Test Expression
          </label>
          <div
            @click="uiStore.openExpressionBuilder(component._id, 'validation', index)"
            class="w-full px-2 py-1.5 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors min-h-12"
          >
            <span v-if="rule.test" class="whitespace-pre-wrap break-all">{{ rule.test }}</span>
            <span v-else class="text-gray-400 dark:text-gray-500">Click to build expression...</span>
          </div>
          <p class="mt-1 text-xs text-gray-400">
            Expression returns true when validation fails
          </p>
        </div>

        <!-- Message -->
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Error Message
          </label>
          <input
            :value="rule.message"
            @input="updateRule(index, 'message', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Validation error message"
            class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
        </div>
      </div>
      </TransitionGroup>

      <!-- Add rule button -->
      <button
        @click="addRule"
        class="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md border border-dashed border-blue-300 dark:border-blue-700 transition-colors"
      >
        + Add Validation Rule
      </button>

      <!-- Quick add buttons with hover animation -->
      <div class="flex flex-wrap gap-2">
        <button
          @click="validationStore.addValidationRule(component.dataKey, {
            test: `getValue('${component.dataKey}') == ''`,
            message: 'This field is required',
            type: ValidationType.REQUIRED
          })"
          class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300 transition-all duration-150 hover:scale-105"
        >
          + Required
        </button>
        <button
          @click="validationStore.addValidationRule(component.dataKey, {
            test: `getValue('${component.dataKey}').length < 3`,
            message: 'Must be at least 3 characters',
            type: ValidationType.ERROR
          })"
          class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300 transition-all duration-150 hover:scale-105"
        >
          + Min Length
        </button>
        <button
          @click="validationStore.addValidationRule(component.dataKey, {
            test: `Number(getValue('${component.dataKey}')) < 0`,
            message: 'Must be a positive number',
            type: ValidationType.ERROR
          })"
          class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300 transition-all duration-150 hover:scale-105"
        >
          + Positive
        </button>
      </div>
    </div>
    </Transition>
  </div>
</template>
