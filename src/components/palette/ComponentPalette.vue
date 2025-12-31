<script setup lang="ts">
import { ref } from 'vue'
import { componentCategories } from '@/utils/componentDefaults'
import DraggableComponent from './DraggableComponent.vue'

// Track expanded categories
const expandedCategories = ref<string[]>(componentCategories.map(c => c.name))

function toggleCategory(name: string) {
  const index = expandedCategories.value.indexOf(name)
  if (index === -1) {
    expandedCategories.value.push(name)
  } else {
    expandedCategories.value.splice(index, 1)
  }
}

function isExpanded(name: string): boolean {
  return expandedCategories.value.includes(name)
}

// Search filter
const searchQuery = ref('')

function filterComponents(components: typeof componentCategories[0]['components']) {
  if (!searchQuery.value.trim()) return components
  const query = searchQuery.value.toLowerCase()
  return components.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.description.toLowerCase().includes(query)
  )
}

function hasVisibleComponents(category: typeof componentCategories[0]): boolean {
  return filterComponents(category.components).length > 0
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="p-3 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Components
      </h2>
      <!-- Search -->
      <div class="relative">
        <svg
          class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search components..."
          class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
      </div>
    </div>

    <!-- Categories -->
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="category in componentCategories"
        :key="category.name"
        v-show="hasVisibleComponents(category)"
        class="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
      >
        <!-- Category Header -->
        <button
          @click="toggleCategory(category.name)"
          class="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <svg
            class="w-4 h-4 text-gray-500 transition-transform"
            :class="{ 'rotate-90': isExpanded(category.name) }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <span class="text-lg">{{ category.icon }}</span>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ category.name }}
          </span>
          <span class="ml-auto text-xs text-gray-400">
            {{ filterComponents(category.components).length }}
          </span>
        </button>

        <!-- Category Components -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[500px]"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 max-h-[500px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div
            v-if="isExpanded(category.name)"
            class="pb-2 overflow-hidden"
          >
            <DraggableComponent
              v-for="component in filterComponents(category.components)"
              :key="component.type"
              :component="component"
            />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
