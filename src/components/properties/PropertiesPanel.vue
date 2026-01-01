<script setup lang="ts">
import { computed } from 'vue'
import { useTemplateStore } from '@/stores/templateStore'
import { useUIStore } from '@/stores/uiStore'
import { useValidationStore } from '@/stores/validationStore'
import { getComponentInfo, needsOptions } from '@/utils/componentDefaults'
import CommonProperties from './CommonProperties.vue'
import OptionsEditor from './OptionsEditor.vue'
import ValidationRulesEditor from './ValidationRulesEditor.vue'
import ExpressionBuilder from '@/components/expression-builder/ExpressionBuilder.vue'

const templateStore = useTemplateStore()
const uiStore = useUIStore()
const validationStore = useValidationStore()

// Get selected component
const selectedComponent = computed(() => {
  if (!uiStore.selectedComponentId) return null
  return templateStore.components.find(c => c._id === uiStore.selectedComponentId)
})

// Get component info
const componentInfo = computed(() => {
  if (!selectedComponent.value) return null
  return getComponentInfo(selectedComponent.value.type)
})

// Check if component needs options
const showOptions = computed(() => {
  if (!selectedComponent.value) return false
  return needsOptions(selectedComponent.value.type)
})

// Update component property
function updateProperty(key: string, value: unknown) {
  if (!selectedComponent.value) return
  templateStore.updateComponent(selectedComponent.value._id, key, value)
}

// Get the component being edited in expression builder
const expressionComponent = computed(() => {
  if (!uiStore.expressionModal.open) return null
  return templateStore.components.find(c => c._id === uiStore.expressionModal.componentId)
})

// Get current expression value based on field being edited
const currentExpressionValue = computed(() => {
  if (!expressionComponent.value) return ''

  const modal = uiStore.expressionModal
  if (modal.field === 'expression') {
    return expressionComponent.value.expression || ''
  } else if (modal.field === 'enableCondition') {
    return expressionComponent.value.enableCondition || ''
  } else if (modal.field === 'validation' && modal.validationIndex >= 0) {
    const testFn = validationStore.testFunctions.find(
      tf => tf.dataKey === expressionComponent.value?.dataKey
    )
    return testFn?.validations[modal.validationIndex]?.test || ''
  }
  return ''
})

// Handle expression update from builder
function handleExpressionUpdate(value: string) {
  const modal = uiStore.expressionModal
  if (!expressionComponent.value) return

  if (modal.field === 'expression') {
    templateStore.updateComponent(expressionComponent.value._id, 'expression', value)
  } else if (modal.field === 'enableCondition') {
    templateStore.updateComponent(expressionComponent.value._id, 'enableCondition', value)
  } else if (modal.field === 'validation' && modal.validationIndex >= 0) {
    validationStore.updateValidationRule(
      expressionComponent.value.dataKey,
      modal.validationIndex,
      'test',
      value
    )
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="p-3 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Properties
      </h2>
    </div>

    <!-- Content with transition between empty and properties -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-4"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 -translate-x-4"
      mode="out-in"
    >
      <!-- No selection state -->
      <div
        v-if="!selectedComponent"
        key="empty"
        class="flex-1 flex items-center justify-center p-4"
      >
        <div class="text-center text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <p class="text-sm">Select a component to edit its properties</p>
        </div>
      </div>

      <!-- Properties content -->
      <div v-else :key="selectedComponent._id" class="flex-1 overflow-y-auto">
        <!-- Component header -->
        <Transition
          appear
          enter-active-class="transition-all duration-300 ease-out delay-100"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div class="p-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ componentInfo?.icon }}</span>
              <div>
                <div class="font-medium text-gray-900 dark:text-gray-100">
                  {{ componentInfo?.name }}
                </div>
                <div class="text-xs text-gray-500">
                  Type: {{ selectedComponent.type }}
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Property sections with staggered animation -->
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <!-- Common Properties -->
          <Transition
            appear
            enter-active-class="transition-all duration-300 ease-out delay-150"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
          >
            <CommonProperties
              :component="selectedComponent"
              @update="updateProperty"
            />
          </Transition>

          <!-- Options Editor (for select, radio, checkbox, etc.) -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 max-h-0 overflow-hidden"
            enter-to-class="opacity-100 max-h-[1000px]"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 max-h-[1000px]"
            leave-to-class="opacity-0 max-h-0 overflow-hidden"
          >
            <OptionsEditor
              v-if="showOptions"
              :component="selectedComponent"
              @update="updateProperty"
            />
          </Transition>

          <!-- Validation Rules -->
          <Transition
            appear
            enter-active-class="transition-all duration-300 ease-out delay-200"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
          >
            <ValidationRulesEditor
              :component="selectedComponent"
              @update="updateProperty"
            />
          </Transition>
        </div>
      </div>
    </Transition>

    <!-- Expression Builder Modal -->
    <ExpressionBuilder
      v-if="uiStore.expressionModal.open && expressionComponent"
      :model-value="currentExpressionValue"
      :component-id="expressionComponent._id"
      @update:model-value="handleExpressionUpdate"
      @close="uiStore.closeExpressionBuilder()"
    />
  </div>
</template>
