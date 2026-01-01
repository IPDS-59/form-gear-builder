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
        <!-- Click to open HTML editor for INNER_HTML type -->
        <template v-if="isInnerHTML">
          <div
            @click="openHtmlEditor"
            class="w-full px-2.5 py-1.5 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors min-h-12"
          >
            <span v-if="component.label" class="whitespace-pre-wrap break-all line-clamp-4">{{ component.label }}</span>
            <span v-else class="text-gray-400 dark:text-gray-500">Click to edit HTML content...</span>
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
