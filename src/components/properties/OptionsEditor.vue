<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BuilderComponent, Option, SourceAPI } from '@/types'
import { OptionType } from '@/types'

const props = defineProps<{
  component: BuilderComponent
}>()

const emit = defineEmits<{
  update: [key: string, value: unknown]
}>()

const isExpanded = ref(true)
const showAPIConfig = ref(false)

// Default empty API config
const defaultAPIConfig: SourceAPI = {
  baseUrl: '',
  value: '',
  label: '',
  data: '',
}

// Current API config (first item in array or default)
const apiConfig = computed({
  get: () => props.component.sourceAPI?.[0] ?? { ...defaultAPIConfig },
  set: (value) => emit('update', 'sourceAPI', [value])
})

// API config form state
const apiForm = ref<SourceAPI>({ ...defaultAPIConfig })

function openAPIConfig() {
  apiForm.value = { ...apiConfig.value }
  showAPIConfig.value = true
}

function closeAPIConfig() {
  showAPIConfig.value = false
}

function saveAPIConfig() {
  emit('update', 'sourceAPI', [apiForm.value])
  showAPIConfig.value = false
}

function updateAPIField(field: keyof SourceAPI, value: unknown) {
  apiForm.value = { ...apiForm.value, [field]: value }
}

// Filter dependencies management
function addFilterDependency() {
  const current = apiForm.value.filterDependencies ?? []
  apiForm.value = {
    ...apiForm.value,
    filterDependencies: [...current, { params: '', sourceAnswer: '' }]
  }
}

function updateFilterDependency(index: number, field: 'params' | 'sourceAnswer', value: string) {
  const deps = [...(apiForm.value.filterDependencies ?? [])]
  const existing = deps[index] ?? { params: '', sourceAnswer: '' }
  deps[index] = { ...existing, [field]: value }
  apiForm.value = { ...apiForm.value, filterDependencies: deps }
}

function removeFilterDependency(index: number) {
  const deps = (apiForm.value.filterDependencies ?? []).filter((_, i) => i !== index)
  apiForm.value = { ...apiForm.value, filterDependencies: deps.length > 0 ? deps : undefined }
}

// Current option type
const optionType = computed({
  get: () => props.component.typeOption ?? OptionType.STATIC,
  set: (value) => emit('update', 'typeOption', value)
})

// Options array
const options = computed({
  get: () => props.component.options ?? [],
  set: (value) => emit('update', 'options', value)
})

function toggle() {
  isExpanded.value = !isExpanded.value
}

function addOption() {
  const newOptions: Option[] = [
    ...options.value,
    {
      label: `Option ${options.value.length + 1}`,
      value: `option_${options.value.length + 1}`
    }
  ]
  emit('update', 'options', newOptions)
}

function updateOption(index: number, field: keyof Option, value: string | number | boolean) {
  const newOptions = [...options.value]
  const existing = newOptions[index]
  if (existing) {
    newOptions[index] = { ...existing, [field]: value }
    emit('update', 'options', newOptions)
  }
}

function removeOption(index: number) {
  const newOptions = options.value.filter((_, i) => i !== index)
  emit('update', 'options', newOptions)
}

function moveOption(index: number, direction: 'up' | 'down') {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex < 0 || newIndex >= options.value.length) return

  const newOptions = [...options.value]
  const current = newOptions[index]
  const target = newOptions[newIndex]
  if (current && target) {
    newOptions[index] = target
    newOptions[newIndex] = current
    emit('update', 'options', newOptions)
  }
}

function handleSourceOption(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update', 'sourceOption', target.value)
}

function handleTypeChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update', 'typeOption', Number(target.value))
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
        Options
      </span>
      <span class="ml-auto text-xs text-gray-400">
        {{ options.length }} items
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
      <!-- Option Type -->
      <div>
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Option Source
        </label>
        <select
          :value="optionType"
          @change="handleTypeChange"
          class="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option :value="OptionType.STATIC">Static Options</option>
          <option :value="OptionType.REFERENCE">Reference (from another field)</option>
          <option :value="OptionType.API">API Lookup</option>
        </select>
      </div>

      <!-- Static Options with TransitionGroup -->
      <TransitionGroup
        v-if="optionType === OptionType.STATIC"
        tag="div"
        class="space-y-2"
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in absolute w-full"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95 -translate-x-4"
        move-class="transition-transform duration-200"
      >
        <div
          v-for="(option, index) in options"
          :key="`option-${index}-${option.value}`"
          class="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
        >
          <!-- Move buttons -->
          <div class="flex flex-col gap-0.5">
            <button
              @click="moveOption(index, 'up')"
              :disabled="index === 0"
              class="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              @click="moveOption(index, 'down')"
              :disabled="index === options.length - 1"
              class="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <!-- Option fields -->
          <div class="flex-1 space-y-1.5">
            <input
              :value="option.label"
              @input="updateOption(index, 'label', ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="Label"
              class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
            <input
              :value="option.value"
              @input="updateOption(index, 'value', ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="Value"
              class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
            <!-- Open field checkbox -->
            <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                :checked="option.open || false"
                @change="updateOption(index, 'open', ($event.target as HTMLInputElement).checked)"
                class="w-3.5 h-3.5 rounded border-gray-300 text-blue-600"
              >
              Has open field
            </label>
          </div>

          <!-- Delete button -->
          <button
            @click="removeOption(index)"
            class="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-gray-400 hover:text-red-500"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Add option button -->
        <button
          key="add-btn"
          @click="addOption"
          class="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md border border-dashed border-blue-300 dark:border-blue-700 transition-colors"
        >
          + Add Option
        </button>
      </TransitionGroup>

      <!-- Reference Options -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
        mode="out-in"
      >
      <div v-if="optionType === OptionType.REFERENCE" key="reference">
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Source Field (DataKey)
        </label>
        <input
          :value="component.sourceOption || ''"
          @input="handleSourceOption"
          type="text"
          placeholder="other_field_datakey"
          class="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <p class="mt-1 text-xs text-gray-400">
          Options will be populated from the selected field's answer
        </p>
      </div>

      <!-- API Options -->
      <div v-else-if="optionType === OptionType.API" key="api" class="space-y-3">
        <!-- Current API config summary -->
        <div v-if="apiConfig.baseUrl" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p class="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Current API Configuration</p>
          <p class="text-xs text-blue-600 dark:text-blue-400 font-mono truncate">{{ apiConfig.baseUrl }}</p>
          <div class="flex gap-2 mt-1 text-xs text-blue-500 dark:text-blue-400">
            <span>Label: {{ apiConfig.label || '-' }}</span>
            <span>Value: {{ apiConfig.value || '-' }}</span>
          </div>
        </div>
        <div v-else class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          <p class="text-xs text-yellow-700 dark:text-yellow-300">
            No API source configured yet. Click the button below to set up an API endpoint.
          </p>
        </div>

        <button
          @click="openAPIConfig"
          class="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md border border-blue-300 dark:border-blue-700 transition-colors"
        >
          {{ apiConfig.baseUrl ? 'Edit API Source' : 'Configure API Source' }}
        </button>
      </div>
      </Transition>
    </div>
    </Transition>

    <!-- API Configuration Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showAPIConfig"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click.self="closeAPIConfig"
        >
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
            appear
          >
            <div
              v-if="showAPIConfig"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              <!-- Modal Header -->
              <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Configure API Source
                </h3>
                <button
                  @click="closeAPIConfig"
                  class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Modal Body -->
              <div class="flex-1 overflow-y-auto p-4 space-y-4">
                <!-- Base URL -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Base URL <span class="text-red-500">*</span>
                  </label>
                  <input
                    :value="apiForm.baseUrl"
                    @input="updateAPIField('baseUrl', ($event.target as HTMLInputElement).value)"
                    type="url"
                    placeholder="https://api.example.com/options"
                    class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                  <p class="mt-1 text-xs text-gray-500">The API endpoint URL to fetch options from</p>
                </div>

                <!-- Data Path -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Path <span class="text-red-500">*</span>
                  </label>
                  <input
                    :value="apiForm.data"
                    @input="updateAPIField('data', ($event.target as HTMLInputElement).value)"
                    type="text"
                    placeholder="data.items"
                    class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                  <p class="mt-1 text-xs text-gray-500">JSON path to the array of options in the response</p>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <!-- Label Key -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Label Key <span class="text-red-500">*</span>
                    </label>
                    <input
                      :value="apiForm.label"
                      @input="updateAPIField('label', ($event.target as HTMLInputElement).value)"
                      type="text"
                      placeholder="name"
                      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                    <p class="mt-1 text-xs text-gray-500">Key for display text</p>
                  </div>

                  <!-- Value Key -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Value Key <span class="text-red-500">*</span>
                    </label>
                    <input
                      :value="apiForm.value"
                      @input="updateAPIField('value', ($event.target as HTMLInputElement).value)"
                      type="text"
                      placeholder="id"
                      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                    <p class="mt-1 text-xs text-gray-500">Key for the value</p>
                  </div>
                </div>

                <!-- Optional Fields Divider -->
                <div class="relative py-2">
                  <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div class="relative flex justify-center">
                    <span class="px-2 bg-white dark:bg-gray-800 text-xs text-gray-500">Optional Settings</span>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <!-- ID -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ID
                    </label>
                    <input
                      :value="apiForm.id || ''"
                      @input="updateAPIField('id', ($event.target as HTMLInputElement).value)"
                      type="text"
                      placeholder="api-source-1"
                      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                  </div>

                  <!-- Version -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Version
                    </label>
                    <input
                      :value="apiForm.version || ''"
                      @input="updateAPIField('version', ($event.target as HTMLInputElement).value)"
                      type="text"
                      placeholder="v1"
                      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                  </div>
                </div>

                <!-- Table Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Table Name
                  </label>
                  <input
                    :value="apiForm.tableName || ''"
                    @input="updateAPIField('tableName', ($event.target as HTMLInputElement).value)"
                    type="text"
                    placeholder="provinces"
                    class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>

                <!-- Filter Dependencies -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Filter Dependencies
                    </label>
                    <button
                      @click="addFilterDependency"
                      class="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      + Add Filter
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 mb-2">Filter API results based on other field answers</p>

                  <TransitionGroup
                    tag="div"
                    class="space-y-2"
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 scale-95"
                    enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0 scale-95"
                  >
                    <div
                      v-for="(dep, index) in apiForm.filterDependencies ?? []"
                      :key="`filter-${index}`"
                      class="flex gap-2 items-start p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md"
                    >
                      <div class="flex-1 space-y-2">
                        <input
                          :value="dep.params"
                          @input="updateFilterDependency(index, 'params', ($event.target as HTMLInputElement).value)"
                          type="text"
                          placeholder="API param (e.g., province_id)"
                          class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                        <input
                          :value="dep.sourceAnswer"
                          @input="updateFilterDependency(index, 'sourceAnswer', ($event.target as HTMLInputElement).value)"
                          type="text"
                          placeholder="Source field dataKey"
                          class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                      </div>
                      <button
                        @click="removeFilterDependency(index)"
                        class="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-gray-400 hover:text-red-500"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </TransitionGroup>

                  <div
                    v-if="!apiForm.filterDependencies?.length"
                    class="text-xs text-gray-400 italic py-2"
                  >
                    No filter dependencies configured
                  </div>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                  @click="closeAPIConfig"
                  class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  @click="saveAPIConfig"
                  :disabled="!apiForm.baseUrl || !apiForm.label || !apiForm.value || !apiForm.data"
                  class="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
