<script setup lang="ts">
import { useUIStore } from '@/stores/uiStore'

const uiStore = useUIStore()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="uiStore.notification"
        class="fixed bottom-4 right-4 z-50 max-w-sm"
      >
        <div
          class="rounded-lg shadow-lg p-4 flex items-start gap-3"
          :class="{
            'bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800': uiStore.notification.type === 'success',
            'bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800': uiStore.notification.type === 'error',
            'bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800': uiStore.notification.type === 'warning',
            'bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800': uiStore.notification.type === 'info',
          }"
        >
          <!-- Icon -->
          <div class="shrink-0">
            <!-- Success -->
            <svg
              v-if="uiStore.notification.type === 'success'"
              class="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <!-- Error -->
            <svg
              v-else-if="uiStore.notification.type === 'error'"
              class="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <!-- Warning -->
            <svg
              v-else-if="uiStore.notification.type === 'warning'"
              class="w-5 h-5 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <!-- Info -->
            <svg
              v-else
              class="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-medium"
              :class="{
                'text-green-800 dark:text-green-200': uiStore.notification.type === 'success',
                'text-red-800 dark:text-red-200': uiStore.notification.type === 'error',
                'text-yellow-800 dark:text-yellow-200': uiStore.notification.type === 'warning',
                'text-blue-800 dark:text-blue-200': uiStore.notification.type === 'info',
              }"
            >
              {{ uiStore.notification.message }}
            </p>
          </div>

          <!-- Close button -->
          <button
            @click="uiStore.hideNotification"
            class="shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
          >
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
