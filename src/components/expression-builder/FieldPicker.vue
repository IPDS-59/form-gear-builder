<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTemplateStore } from '@/stores/templateStore'
import { getComponentInfo } from '@/utils/componentDefaults'

const props = defineProps<{
  componentId: string
}>()

const emit = defineEmits<{
  select: [dataKey: string]
}>()

const templateStore = useTemplateStore()

// Search query
const searchQuery = ref('')

// Get all available fields
const availableFields = computed(() => {
  return templateStore.components
    .filter(c => c._id !== props.componentId) // Exclude current component
    .map(c => ({
      dataKey: c.dataKey,
      label: c.label,
      type: c.type,
      icon: getComponentInfo(c.type)?.icon || '📦',
      typeName: getComponentInfo(c.type)?.name || 'Unknown'
    }))
    .filter(f => {
      if (!searchQuery.value.trim()) return true
      const query = searchQuery.value.toLowerCase()
      return f.dataKey.toLowerCase().includes(query) ||
             f.label.toLowerCase().includes(query)
    })
})

function handleSelect(dataKey: string) {
  emit('select', dataKey)
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="p-3 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Fields
      </h3>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search fields..."
        class="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
    </div>

    <!-- Fields list -->
    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="availableFields.length === 0" class="text-center py-4 text-sm text-gray-400">
        No fields available
      </div>

      <button
        v-for="field in availableFields"
        :key="field.dataKey"
        @click="handleSelect(field.dataKey)"
        class="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm">{{ field.icon }}</span>
          <div class="flex-1 min-w-0">
            <div class="text-sm text-gray-900 dark:text-gray-100 truncate">
              {{ field.dataKey }}
            </div>
            <div class="text-xs text-gray-500 truncate">
              {{ field.label }} ({{ field.typeName }})
            </div>
          </div>
        </div>
      </button>
    </div>

    <!-- Special row markers -->
    <div class="p-3 border-t border-gray-200 dark:border-gray-700">
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        Nested Row Markers
      </h4>
      <div class="flex flex-wrap gap-1">
        <button
          @click="emit('select', '@$ROW$')"
          class="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50"
        >
          @$ROW$
        </button>
        <button
          @click="emit('select', '@$ROW1$')"
          class="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50"
        >
          @$ROW1$
        </button>
        <button
          @click="emit('select', '@$ROW2$')"
          class="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50"
        >
          @$ROW2$
        </button>
      </div>
    </div>
  </div>
</template>
