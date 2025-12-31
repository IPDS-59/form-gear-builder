<script setup lang="ts">
const emit = defineEmits<{
  select: [func: string]
}>()

// Available functions
const functions = [
  {
    category: 'Field Access',
    items: [
      { name: 'getValue()', code: "getValue('')", description: 'Get field value by dataKey' },
      { name: 'getRowIndex()', code: 'getRowIndex()', description: 'Get current row index in nested' },
      { name: 'getProp()', code: "getProp('', '')", description: 'Get field property' },
    ]
  },
  {
    category: 'Type Conversion',
    items: [
      { name: 'Number()', code: 'Number()', description: 'Convert to number' },
      { name: 'String()', code: 'String()', description: 'Convert to string' },
      { name: 'Boolean()', code: 'Boolean()', description: 'Convert to boolean' },
      { name: 'parseInt()', code: 'parseInt(, 10)', description: 'Parse integer' },
      { name: 'parseFloat()', code: 'parseFloat()', description: 'Parse float' },
    ]
  },
  {
    category: 'String Methods',
    items: [
      { name: '.length', code: '.length', description: 'String length' },
      { name: '.trim()', code: '.trim()', description: 'Remove whitespace' },
      { name: '.toLowerCase()', code: '.toLowerCase()', description: 'Convert to lowercase' },
      { name: '.toUpperCase()', code: '.toUpperCase()', description: 'Convert to uppercase' },
      { name: '.includes()', code: ".includes('')", description: 'Check if string contains' },
      { name: '.startsWith()', code: ".startsWith('')", description: 'Check if starts with' },
      { name: '.endsWith()', code: ".endsWith('')", description: 'Check if ends with' },
    ]
  },
  {
    category: 'Array Methods',
    items: [
      { name: '.length', code: '.length', description: 'Array length' },
      { name: '.includes()', code: '.includes()', description: 'Check if array contains' },
      { name: '.indexOf()', code: '.indexOf()', description: 'Find index of element' },
      { name: '.join()', code: ".join(',')", description: 'Join array elements' },
    ]
  },
  {
    category: 'Math',
    items: [
      { name: 'Math.abs()', code: 'Math.abs()', description: 'Absolute value' },
      { name: 'Math.round()', code: 'Math.round()', description: 'Round to nearest integer' },
      { name: 'Math.floor()', code: 'Math.floor()', description: 'Round down' },
      { name: 'Math.ceil()', code: 'Math.ceil()', description: 'Round up' },
      { name: 'Math.min()', code: 'Math.min()', description: 'Minimum value' },
      { name: 'Math.max()', code: 'Math.max()', description: 'Maximum value' },
    ]
  },
]

function handleSelect(code: string) {
  emit('select', code)
}
</script>

<template>
  <div>
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
      Functions
    </h3>

    <div class="space-y-4">
      <div v-for="category in functions" :key="category.category">
        <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          {{ category.category }}
        </h4>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="func in category.items"
            :key="func.name"
            @click="handleSelect(func.code)"
            class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            :title="func.description"
          >
            {{ func.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
