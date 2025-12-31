<script setup lang="ts">
import { computed } from 'vue'
import type { BuilderComponent } from '@/types'
import { ComponentType } from '@/types'

const props = defineProps<{
  component: BuilderComponent
}>()

// Get sample options for display
const sampleOptions = computed(() => {
  return props.component.options?.slice(0, 3) || [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ]
})
</script>

<template>
  <div class="px-3 pb-3 pointer-events-none select-none">
    <!-- TEXT INPUT -->
    <div v-if="component.type === ComponentType.TEXT" class="space-y-1">
      <div class="h-9 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center px-3">
        <span class="text-gray-400 text-sm">Enter text...</span>
      </div>
    </div>

    <!-- TEXTAREA -->
    <div v-else-if="component.type === ComponentType.TEXTAREA" class="space-y-1">
      <div class="h-20 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 p-2">
        <span class="text-gray-400 text-sm">Enter text...</span>
      </div>
    </div>

    <!-- EMAIL -->
    <div v-else-if="component.type === ComponentType.EMAIL" class="space-y-1">
      <div class="h-9 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center px-3 gap-2">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span class="text-gray-400 text-sm">email@example.com</span>
      </div>
    </div>

    <!-- URL -->
    <div v-else-if="component.type === ComponentType.URL" class="space-y-1">
      <div class="h-9 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center px-3 gap-2">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span class="text-gray-400 text-sm">https://example.com</span>
      </div>
    </div>

    <!-- NUMBER -->
    <div v-else-if="component.type === ComponentType.NUMBER || component.type === ComponentType.DECIMAL" class="space-y-1">
      <div class="h-9 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center px-3">
        <span class="text-gray-400 text-sm">0</span>
      </div>
    </div>

    <!-- CURRENCY -->
    <div v-else-if="component.type === ComponentType.CURRENCY" class="space-y-1">
      <div class="h-9 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center px-3 gap-2">
        <span class="text-gray-500 font-medium text-sm">{{ component.currency || '$' }}</span>
        <span class="text-gray-400 text-sm">0.00</span>
      </div>
    </div>

    <!-- DATE -->
    <div v-else-if="component.type === ComponentType.DATE" class="space-y-1">
      <div class="h-9 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center px-3 justify-between">
        <span class="text-gray-400 text-sm">DD/MM/YYYY</span>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <!-- DATETIME -->
    <div v-else-if="component.type === ComponentType.DATETIME" class="space-y-1">
      <div class="h-9 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center px-3 justify-between">
        <span class="text-gray-400 text-sm">DD/MM/YYYY HH:mm</span>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <!-- TIME -->
    <div v-else-if="component.type === ComponentType.TIME" class="space-y-1">
      <div class="h-9 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center px-3 justify-between">
        <span class="text-gray-400 text-sm">HH:mm</span>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>

    <!-- MONTH / WEEK -->
    <div v-else-if="component.type === ComponentType.MONTH || component.type === ComponentType.WEEK" class="space-y-1">
      <div class="h-9 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center px-3 justify-between">
        <span class="text-gray-400 text-sm">{{ component.type === ComponentType.MONTH ? 'Select month' : 'Select week' }}</span>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <!-- RADIO -->
    <div v-else-if="component.type === ComponentType.RADIO" class="space-y-2">
      <div v-for="(opt, idx) in sampleOptions" :key="idx" class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center">
          <div v-if="idx === 0" class="w-2 h-2 rounded-full bg-blue-500"></div>
        </div>
        <span class="text-sm text-gray-600 dark:text-gray-300">{{ opt.label }}</span>
      </div>
    </div>

    <!-- CHECKBOX -->
    <div v-else-if="component.type === ComponentType.CHECKBOX || component.type === ComponentType.MULTIPLE_SELECT" class="space-y-2">
      <div v-for="(opt, idx) in sampleOptions" :key="idx" class="flex items-center gap-2">
        <div class="w-4 h-4 rounded border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center">
          <svg v-if="idx === 0" class="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <span class="text-sm text-gray-600 dark:text-gray-300">{{ opt.label }}</span>
      </div>
    </div>

    <!-- SELECT / DROPDOWN -->
    <div v-else-if="component.type === ComponentType.SELECT" class="space-y-1">
      <div class="h-9 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center px-3 justify-between">
        <span class="text-gray-400 text-sm">Select an option...</span>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- SINGLE CHECK -->
    <div v-else-if="component.type === ComponentType.SINGLE_CHECK" class="flex items-center gap-2">
      <div class="w-4 h-4 rounded border-2 border-gray-400 dark:border-gray-500"></div>
      <span class="text-sm text-gray-600 dark:text-gray-300">{{ component.label || 'Checkbox' }}</span>
    </div>

    <!-- TOGGLE -->
    <div v-else-if="component.type === ComponentType.TOGGLE" class="flex items-center gap-3">
      <div class="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative">
        <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
      </div>
      <span class="text-sm text-gray-600 dark:text-gray-300">Off</span>
    </div>

    <!-- RANGE SLIDER -->
    <div v-else-if="component.type === ComponentType.RANGE_SLIDER" class="space-y-2">
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-500">{{ component.rangeInput?.[0]?.min || 0 }}</span>
        <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full relative">
          <div class="absolute left-0 top-0 h-full w-1/2 bg-blue-500 rounded-full"></div>
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow"></div>
        </div>
        <span class="text-xs text-gray-500">{{ component.rangeInput?.[0]?.max || 100 }}</span>
      </div>
    </div>

    <!-- MASKING -->
    <div v-else-if="component.type === ComponentType.MASKING" class="space-y-1">
      <div class="h-9 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center px-3">
        <span class="text-gray-400 text-sm font-mono">{{ component.maskingFormat || '####-####' }}</span>
      </div>
    </div>

    <!-- PHOTO -->
    <div v-else-if="component.type === ComponentType.PHOTO" class="space-y-1">
      <div class="h-24 bg-gray-100 dark:bg-gray-700 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="text-xs text-gray-400">Click to capture photo</span>
      </div>
    </div>

    <!-- GPS -->
    <div v-else-if="component.type === ComponentType.GPS" class="space-y-1">
      <div class="h-20 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1">
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="text-xs text-gray-400">Lat: 0.0000, Lng: 0.0000</span>
      </div>
    </div>

    <!-- SIGNATURE -->
    <div v-else-if="component.type === ComponentType.SIGNATURE" class="space-y-1">
      <div class="h-24 bg-gray-100 dark:bg-gray-700 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        <span class="text-xs text-gray-400">Sign here</span>
      </div>
    </div>

    <!-- CSV -->
    <div v-else-if="component.type === ComponentType.CSV" class="space-y-1">
      <div class="h-16 bg-gray-100 dark:bg-gray-700 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center gap-2">
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span class="text-xs text-gray-400">Upload CSV file</span>
      </div>
    </div>

    <!-- VARIABLE -->
    <div v-else-if="component.type === ComponentType.VARIABLE" class="space-y-1">
      <div class="h-9 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-300 dark:border-green-700 flex items-center px-3 gap-2">
        <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span class="text-green-600 dark:text-green-400 text-sm font-mono truncate">{{ component.expression || 'expression' }}</span>
      </div>
    </div>

    <!-- INNER HTML -->
    <div v-else-if="component.type === ComponentType.INNER_HTML" class="space-y-1">
      <div class="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-300 dark:border-orange-700">
        <div class="flex items-center gap-2 mb-1">
          <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span class="text-xs text-orange-600 dark:text-orange-400">HTML Content</span>
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2" v-if="component.label">
          {{ component.label.replace(/<[^>]*>/g, '').substring(0, 100) }}{{ component.label.length > 100 ? '...' : '' }}
        </div>
        <div v-else class="text-xs text-gray-400 italic">No content</div>
      </div>
    </div>

    <!-- NOW / TIMESTAMP -->
    <div v-else-if="component.type === ComponentType.NOW" class="space-y-1">
      <div class="h-9 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-300 dark:border-blue-700 flex items-center px-3 gap-2">
        <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-blue-600 dark:text-blue-400 text-sm">Auto-captured timestamp</span>
      </div>
    </div>

    <!-- UNIT -->
    <div v-else-if="component.type === ComponentType.UNIT" class="space-y-1">
      <div class="flex gap-2">
        <div class="flex-1 h-9 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center px-3">
          <span class="text-gray-400 text-sm">0</span>
        </div>
        <div class="w-20 h-9 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center px-2 justify-between">
          <span class="text-gray-500 text-sm">kg</span>
          <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- LIST TEXT REPEAT -->
    <div v-else-if="component.type === ComponentType.LIST_TEXT_REPEAT" class="space-y-2">
      <div v-for="i in 2" :key="i" class="flex items-center gap-2">
        <span class="text-xs text-gray-400 w-4">{{ i }}.</span>
        <div class="flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 flex items-center px-2">
          <span class="text-gray-400 text-sm">Item {{ i }}</span>
        </div>
      </div>
      <button class="text-xs text-blue-500 flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add item
      </button>
    </div>

    <!-- LIST SELECT REPEAT -->
    <div v-else-if="component.type === ComponentType.LIST_SELECT_REPEAT" class="space-y-2">
      <div v-for="i in 2" :key="i" class="flex items-center gap-2">
        <span class="text-xs text-gray-400 w-4">{{ i }}.</span>
        <div class="flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 flex items-center px-2 justify-between">
          <span class="text-gray-400 text-sm">Select...</span>
          <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <button class="text-xs text-blue-500 flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add item
      </button>
    </div>

    <!-- Default fallback -->
    <div v-else class="space-y-1">
      <div class="h-9 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 flex items-center px-3">
        <span class="text-gray-400 text-sm">Input field</span>
      </div>
    </div>
  </div>
</template>
