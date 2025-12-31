<script setup lang="ts">
const emit = defineEmits<{
  operator: [op: string]
  value: [val: string]
}>()

// Operators
const comparisonOperators = ['==', '!=', '>', '<', '>=', '<=']
const logicalOperators = ['&&', '||', '!']
const arithmeticOperators = ['+', '-', '*', '/', '%']

// Common values
const commonValues = [
  { label: "''", value: "''" },
  { label: '0', value: '0' },
  { label: 'true', value: 'true' },
  { label: 'false', value: 'false' },
  { label: 'null', value: 'null' },
  { label: 'undefined', value: 'undefined' },
]
</script>

<template>
  <div class="space-y-4">
    <!-- Comparison Operators -->
    <div>
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        Comparison
      </h4>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="op in comparisonOperators"
          :key="op"
          @click="emit('operator', op)"
          class="px-3 py-1.5 text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {{ op }}
        </button>
      </div>
    </div>

    <!-- Logical Operators -->
    <div>
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        Logical
      </h4>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="op in logicalOperators"
          :key="op"
          @click="emit('operator', op)"
          class="px-3 py-1.5 text-sm font-mono bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
        >
          {{ op }}
        </button>
      </div>
    </div>

    <!-- Arithmetic Operators -->
    <div>
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        Arithmetic
      </h4>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="op in arithmeticOperators"
          :key="op"
          @click="emit('operator', op)"
          class="px-3 py-1.5 text-sm font-mono bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
        >
          {{ op }}
        </button>
      </div>
    </div>

    <!-- Grouping -->
    <div>
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        Grouping
      </h4>
      <div class="flex flex-wrap gap-1">
        <button
          @click="emit('value', '(')"
          class="px-3 py-1.5 text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          (
        </button>
        <button
          @click="emit('value', ')')"
          class="px-3 py-1.5 text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          )
        </button>
        <button
          @click="emit('value', '? : ')"
          class="px-3 py-1.5 text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Ternary operator"
        >
          ? :
        </button>
      </div>
    </div>

    <!-- Common Values -->
    <div>
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        Common Values
      </h4>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="val in commonValues"
          :key="val.label"
          @click="emit('value', val.value)"
          class="px-3 py-1.5 text-sm font-mono bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
        >
          {{ val.label }}
        </button>
      </div>
    </div>
  </div>
</template>
