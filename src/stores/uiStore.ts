import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PanelState } from '@/types'

export const useUIStore = defineStore('ui', () => {
  // Selected component ID
  const selectedComponentId = ref<string | null>(null)

  // Panel sizes and states
  const panels = ref<PanelState>({
    leftWidth: 250,
    rightWidth: 350,
    leftCollapsed: false,
    rightCollapsed: false,
  })

  // Preview mode
  const previewMode = ref(false)

  // Expression builder modal
  const expressionModal = ref({
    open: false,
    field: '' as 'enableCondition' | 'expression' | 'validation',
    componentId: '',
    validationIndex: -1,
  })

  // Drag state
  const dragState = ref({
    isDragging: false,
    draggedType: null as number | null,
    draggedId: null as string | null,
    draggedParentId: null as string | null | undefined,
    dropTarget: null as string | null,
    dropIndex: -1,
  })

  // Mobile tap-to-place state (pending component to add)
  const pendingComponent = ref<{
    type: number
    defaultProps?: Record<string, unknown>
  } | null>(null)

  // History state
  const history = ref<string[]>([])
  const historyIndex = ref(-1)
  const maxHistorySize = 50

  // Dark mode
  const darkMode = ref(false)

  // Notification
  const notification = ref<{
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  } | null>(null)

  // Is dragging (simple boolean accessor)
  const isDragging = computed(() => dragState.value.isDragging)

  // Select a component
  function selectComponent(id: string | null): void {
    selectedComponentId.value = id
  }

  // Toggle left panel
  function toggleLeftPanel(): void {
    panels.value.leftCollapsed = !panels.value.leftCollapsed
  }

  // Toggle right panel
  function toggleRightPanel(): void {
    panels.value.rightCollapsed = !panels.value.rightCollapsed
  }

  // Resize left panel
  function resizeLeftPanel(width: number): void {
    panels.value.leftWidth = Math.max(200, Math.min(400, width))
  }

  // Resize right panel
  function resizeRightPanel(width: number): void {
    panels.value.rightWidth = Math.max(300, Math.min(500, width))
  }

  // Toggle preview mode
  function togglePreview(): void {
    previewMode.value = !previewMode.value
    if (previewMode.value) {
      selectedComponentId.value = null
    }
  }

  // Open expression builder
  function openExpressionBuilder(
    componentId: string,
    field: 'enableCondition' | 'expression' | 'validation',
    validationIndex?: number
  ): void {
    expressionModal.value = {
      open: true,
      field,
      componentId,
      validationIndex: validationIndex ?? -1,
    }
  }

  // Close expression builder
  function closeExpressionBuilder(): void {
    expressionModal.value = {
      open: false,
      field: 'enableCondition',
      componentId: '',
      validationIndex: -1,
    }
  }

  // Start drag
  function startDrag(type: number | null, id: string | null, parentId?: string | null): void {
    dragState.value = {
      isDragging: true,
      draggedType: type,
      draggedId: id,
      draggedParentId: parentId,
      dropTarget: null,
      dropIndex: -1,
    }
  }

  // Update drop target
  function updateDropTarget(target: string | null, index: number): void {
    dragState.value.dropTarget = target
    dragState.value.dropIndex = index
  }

  // End drag
  function endDrag(): void {
    dragState.value = {
      isDragging: false,
      draggedType: null,
      draggedId: null,
      draggedParentId: null,
      dropTarget: null,
      dropIndex: -1,
    }
  }

  // Can undo
  const canUndo = computed(() => historyIndex.value > 0)

  // Can redo
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  // Add to history
  function addToHistory(state: string): void {
    // Remove any future states if we're not at the end
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    // Add new state
    history.value.push(state)

    // Trim if too large
    if (history.value.length > maxHistorySize) {
      history.value.shift()
    } else {
      historyIndex.value++
    }
  }

  // Undo
  function undo(): string | null {
    if (historyIndex.value > 0) {
      historyIndex.value--
      return history.value[historyIndex.value] ?? null
    }
    return null
  }

  // Redo
  function redo(): string | null {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      return history.value[historyIndex.value] ?? null
    }
    return null
  }

  // Clear history
  function clearHistory(): void {
    history.value = []
    historyIndex.value = -1
  }

  // Toggle dark mode
  function toggleDarkMode(): void {
    darkMode.value = !darkMode.value
    if (darkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Show notification
  function showNotification(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration = 3000
  ): void {
    notification.value = { message, type }

    if (duration > 0) {
      setTimeout(() => {
        notification.value = null
      }, duration)
    }
  }

  // Hide notification
  function hideNotification(): void {
    notification.value = null
  }

  // Set dragging state (simple setter)
  function setDragging(dragging: boolean): void {
    dragState.value.isDragging = dragging
  }

  // Set pending component for mobile tap-to-place
  function setPendingComponent(type: number, defaultProps?: Record<string, unknown>): void {
    pendingComponent.value = { type, defaultProps }
  }

  // Clear pending component
  function clearPendingComponent(): void {
    pendingComponent.value = null
  }

  // Check if there's a pending component
  const hasPendingComponent = computed(() => pendingComponent.value !== null)

  // Clear selection
  function clearSelection(): void {
    selectedComponentId.value = null
  }

  return {
    selectedComponentId,
    panels,
    previewMode,
    expressionModal,
    dragState,
    pendingComponent,
    darkMode,
    notification,
    isDragging,
    hasPendingComponent,
    canUndo,
    canRedo,
    selectComponent,
    clearSelection,
    toggleLeftPanel,
    toggleRightPanel,
    resizeLeftPanel,
    resizeRightPanel,
    togglePreview,
    openExpressionBuilder,
    closeExpressionBuilder,
    startDrag,
    updateDropTarget,
    endDrag,
    setDragging,
    setPendingComponent,
    clearPendingComponent,
    addToHistory,
    undo,
    redo,
    clearHistory,
    toggleDarkMode,
    showNotification,
    hideNotification,
  }
})
