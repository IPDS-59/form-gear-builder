<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BuilderComponent } from '@/types'
import { ComponentType } from '@/types'
import { useTemplateStore } from '@/stores/templateStore'
import { useUIStore } from '@/stores/uiStore'
import { canHaveChildren, getComponentInfo } from '@/utils/componentDefaults'
import DropZone from './DropZone.vue'
import ComponentPreview from './ComponentPreview.vue'

const props = defineProps<{
  component: BuilderComponent
  index: number
}>()

const templateStore = useTemplateStore()
const uiStore = useUIStore()

// Get component info for display
const componentInfo = computed(() => getComponentInfo(props.component.type))

// Check if component can have children
const hasChildren = computed(() => canHaveChildren(props.component.type))

// Get child components
const childComponents = computed(() =>
  templateStore.components.filter(c => c._parent === props.component._id)
)

// Selection state
const isSelected = computed(() => uiStore.selectedComponentId === props.component._id)

// Expanded state for containers
const isExpanded = ref(true)

// Drag state - local ref for this component's visual state
const isDragging = ref(false)

// Check if this specific component is being dragged (from global state)
const isBeingDragged = computed(() => uiStore.dragState.draggedId === props.component._id)

function handleSelect(e: MouseEvent) {
  e.stopPropagation()
  uiStore.selectComponent(props.component._id)
}

function handleDelete(e: MouseEvent) {
  e.stopPropagation()
  templateStore.removeComponent(props.component._id)
  uiStore.clearSelection()
}

function handleDuplicate(e: MouseEvent) {
  e.stopPropagation()
  templateStore.duplicateComponent(props.component._id)
}

function handleDragStart(e: DragEvent) {
  // Stop propagation to prevent parent components from also starting drag
  e.stopPropagation()

  if (!e.dataTransfer) return

  e.dataTransfer.setData('application/json', JSON.stringify({
    type: 'move-component',
    componentId: props.component._id,
    originalParentId: props.component._parent
  }))
  e.dataTransfer.effectAllowed = 'move'

  isDragging.value = true
  uiStore.startDrag(props.component.type, props.component._id, props.component._parent)
}

function handleDragEnd(e: DragEvent) {
  e.stopPropagation()
  isDragging.value = false
  uiStore.endDrag()
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

// Get validation status
const validationStatus = computed(() => {
  // Simple validation check
  if (!props.component.dataKey) return 'error'
  if (!props.component.label) return 'warning'
  return 'valid'
})

// Get type badge color
const typeBadgeColor = computed(() => {
  const type = props.component.type
  if (type === ComponentType.SECTION) return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
  if (type === ComponentType.NESTED) return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
  if (type === ComponentType.VARIABLE) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
})
</script>

<template>
  <Transition
    appear
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-95 translate-y-2"
    enter-to-class="opacity-100 scale-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      :class="[
        'group relative rounded-lg border-2 transition-all duration-200 ease-out',
        isSelected
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800 scale-[1.01]'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md',
        isBeingDragged ? 'opacity-50 scale-95' : '',
        hasChildren ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'
      ]"
      draggable="true"
      @click="handleSelect"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
    >
      <!-- Component Header -->
      <div class="flex items-center gap-2 p-3 cursor-pointer">
        <!-- Expand toggle for containers -->
        <button
          v-if="hasChildren"
          @click.stop="toggleExpand"
          class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors duration-150"
        >
          <svg
            class="w-4 h-4 text-gray-500 transition-transform duration-200"
            :class="{ 'rotate-90': isExpanded }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

      <!-- Drag handle -->
      <div class="cursor-grab p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
        <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
        </svg>
      </div>

      <!-- Icon -->
      <span class="text-lg">{{ componentInfo?.icon || '📦' }}</span>

      <!-- Label and DataKey -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-900 dark:text-gray-100 truncate">
            {{ component.label || 'Untitled' }}
          </span>
          <!-- Type badge -->
          <span :class="['text-xs px-1.5 py-0.5 rounded', typeBadgeColor]">
            {{ componentInfo?.name || 'Unknown' }}
          </span>
        </div>
        <span class="text-xs text-gray-500 dark:text-gray-400 truncate block">
          {{ component.dataKey || 'no-datakey' }}
        </span>
      </div>

      <!-- Validation indicator -->
      <div
        v-if="validationStatus !== 'valid'"
        :class="[
          'w-2 h-2 rounded-full',
          validationStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
        ]"
        :title="validationStatus === 'error' ? 'Missing required fields' : 'Has warnings'"
      />

      <!-- Actions (visible on hover or selected) -->
      <div
        :class="[
          'flex items-center gap-1 transition-opacity',
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        ]"
      >
        <button
          @click="handleDuplicate"
          class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          title="Duplicate"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          @click="handleDelete"
          class="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-gray-500 hover:text-red-600"
          title="Delete"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

      <!-- Visual Preview (for non-container components) -->
      <ComponentPreview
        v-if="!hasChildren"
        :component="component"
      />

      <!-- Children (for SECTION and NESTED) -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-[2000px]"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 max-h-[2000px]"
        leave-to-class="opacity-0 max-h-0"
      >
        <div
          v-if="hasChildren && isExpanded"
          class="px-3 pb-3 overflow-hidden"
        >
          <div class="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-600 space-y-2">
            <!-- Drop zone at top - always present -->
            <DropZone
              position="before"
              :index="0"
              :parent-id="component._id"
            />

            <!-- Child components -->
            <template v-for="(child, childIndex) in childComponents" :key="child._id">
              <CanvasComponent
                :component="child"
                :index="childIndex"
              />

              <!-- Drop zone between children - always present -->
              <DropZone
                position="after"
                :index="childIndex + 1"
                :parent-id="component._id"
              />
            </template>

            <!-- Empty state drop zone - always show when empty -->
            <DropZone
              v-if="childComponents.length === 0"
              position="end"
              :index="0"
              :parent-id="component._id"
              class="min-h-15"
            />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
