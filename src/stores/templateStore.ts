import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  BuilderComponent,
  TemplateState,
  TemplateComponent,
  FormMetadata,
  ComponentType,
} from '@/types'
import { generateId, createDefaultComponent } from '@/utils/componentDefaults'

export const useTemplateStore = defineStore('template', () => {
  // Form metadata
  const metadata = ref<FormMetadata>({
    description: '',
    dataKey: 'new_form',
    title: 'New Form',
    version: '1.0.0',
  })

  // Components in the form (flat list with parent references)
  const components = ref<BuilderComponent[]>([])

  // Get root level components (no parent)
  const rootComponents = computed(() =>
    components.value.filter((c) => !c._parent)
  )

  // Get children of a component
  function getChildren(parentId: string): BuilderComponent[] {
    return components.value.filter((c) => c._parent === parentId)
  }

  // Get component by ID
  function getComponent(id: string): BuilderComponent | undefined {
    return components.value.find((c) => c._id === id)
  }

  // Get component by dataKey
  function getComponentByDataKey(dataKey: string): BuilderComponent | undefined {
    return components.value.find((c) => c.dataKey === dataKey)
  }

  // Add a new component (accepts either a type or a BuilderComponent)
  function addComponent(
    componentOrType: ComponentType | BuilderComponent,
    index?: number,
    parentId?: string
  ): BuilderComponent {
    let newComponent: BuilderComponent

    if (typeof componentOrType === 'object') {
      // It's already a BuilderComponent
      newComponent = componentOrType
      newComponent._parent = parentId
    } else {
      // It's a ComponentType, create new component
      newComponent = createDefaultComponent(componentOrType)
      newComponent._parent = parentId
    }

    if (parentId && index !== undefined) {
      // Find insertion point among siblings
      const siblings = getChildren(parentId)
      if (index >= siblings.length) {
        components.value.push(newComponent)
      } else {
        const sibling = siblings[index]
        if (sibling) {
          const siblingIndex = components.value.indexOf(sibling)
          components.value.splice(siblingIndex, 0, newComponent)
        } else {
          components.value.push(newComponent)
        }
      }
    } else if (index !== undefined) {
      // Root level with specific index
      const roots = rootComponents.value
      if (index >= roots.length) {
        components.value.push(newComponent)
      } else {
        const root = roots[index]
        if (root) {
          const rootIndex = components.value.indexOf(root)
          components.value.splice(rootIndex, 0, newComponent)
        } else {
          components.value.push(newComponent)
        }
      }
    } else {
      components.value.push(newComponent)
    }

    return newComponent
  }

  // Remove a component and its children
  function removeComponent(id: string): void {
    const removeRecursive = (compId: string) => {
      // Remove children first
      const children = getChildren(compId)
      children.forEach((child) => removeRecursive(child._id))

      // Remove the component
      const index = components.value.findIndex((c) => c._id === compId)
      if (index !== -1) {
        components.value.splice(index, 1)
      }
    }

    removeRecursive(id)
  }

  // Update a component (accepts either updates object or key-value pair)
  function updateComponent(
    id: string,
    keyOrUpdates: string | Partial<BuilderComponent>,
    value?: unknown
  ): void {
    const index = components.value.findIndex((c) => c._id === id)
    if (index !== -1) {
      const existing = components.value[index]
      if (existing) {
        if (typeof keyOrUpdates === 'string') {
          // Key-value pair update
          components.value[index] = {
            ...existing,
            [keyOrUpdates]: value
          }
        } else {
          // Object update
          components.value[index] = { ...existing, ...keyOrUpdates }
        }
      }
    }
  }

  // Move a component
  function moveComponent(
    id: string,
    newParentId: string | undefined,
    newIndex: number
  ): void {
    const componentIndex = components.value.findIndex((c) => c._id === id)
    if (componentIndex === -1) return

    const component = components.value[componentIndex]
    if (!component) return

    // Prevent dropping into self or children (would cause circular reference)
    if (newParentId) {
      let parent: BuilderComponent | undefined = getComponent(newParentId)
      while (parent) {
        if (parent._id === id) return // Cannot move into self or descendants
        parent = parent._parent ? getComponent(parent._parent) : undefined
      }
    }

    // Store original parent to check if we're moving within same parent
    const originalParent = component._parent
    const isMovingWithinSameParent = originalParent === newParentId

    // Get current position info before removal
    let currentIndexInParent = -1
    if (isMovingWithinSameParent) {
      const currentSiblings = newParentId
        ? components.value.filter(c => c._parent === newParentId)
        : components.value.filter(c => !c._parent)
      currentIndexInParent = currentSiblings.findIndex(c => c._id === id)
    }

    // Create updated component with new parent
    const updatedComponent: BuilderComponent = {
      ...component,
      _id: component._id,
      dataKey: component.dataKey,
      label: component.label,
      type: component.type,
      _parent: newParentId
    }

    // Remove from current position
    components.value.splice(componentIndex, 1)

    // Adjust newIndex if moving within same parent and moving down
    let adjustedIndex = newIndex
    if (isMovingWithinSameParent && currentIndexInParent !== -1 && currentIndexInParent < newIndex) {
      adjustedIndex = Math.max(0, newIndex - 1)
    }

    // Find the insertion point in the flat array
    const targetSiblings = newParentId
      ? components.value.filter(c => c._parent === newParentId)
      : components.value.filter(c => !c._parent)

    if (adjustedIndex >= targetSiblings.length) {
      // Insert at end - find the last sibling or parent
      if (targetSiblings.length > 0) {
        const lastSibling = targetSiblings[targetSiblings.length - 1]
        if (lastSibling) {
          const lastSiblingIndex = components.value.indexOf(lastSibling)
          components.value.splice(lastSiblingIndex + 1, 0, updatedComponent)
        } else {
          components.value.push(updatedComponent)
        }
      } else if (newParentId) {
        // No siblings yet, insert after parent
        const parentIndex = components.value.findIndex(c => c._id === newParentId)
        components.value.splice(parentIndex + 1, 0, updatedComponent)
      } else {
        // Root level, no siblings - push to end
        components.value.push(updatedComponent)
      }
    } else {
      // Insert at specific position
      const targetSibling = targetSiblings[adjustedIndex]
      if (targetSibling) {
        const targetIndex = components.value.indexOf(targetSibling)
        components.value.splice(targetIndex, 0, updatedComponent)
      } else {
        components.value.push(updatedComponent)
      }
    }
  }

  // Duplicate a component
  function duplicateComponent(id: string): BuilderComponent | undefined {
    const original = getComponent(id)
    if (!original) return undefined

    const duplicate: BuilderComponent = {
      ...JSON.parse(JSON.stringify(original)),
      _id: generateId(),
      dataKey: `${original.dataKey}_copy`,
    }

    // Find position after original
    const index = components.value.indexOf(original)
    components.value.splice(index + 1, 0, duplicate)

    return duplicate
  }

  // Get all dataKeys (for expression builder autocomplete)
  const allDataKeys = computed(() =>
    components.value.map((c) => ({
      dataKey: c.dataKey,
      label: c.label,
      type: c.type,
    }))
  )

  // Check if dataKey is unique
  function isDataKeyUnique(dataKey: string, excludeId?: string): boolean {
    return !components.value.some(
      (c) => c.dataKey === dataKey && c._id !== excludeId
    )
  }

  // Convert to template JSON
  function toTemplateJSON(): TemplateState {
    const buildComponentTree = (
      parentId?: string
    ): TemplateComponent[][] => {
      const children = parentId
        ? getChildren(parentId)
        : rootComponents.value

      if (children.length === 0) return []

      // Group into rows (for now, each component is its own row)
      return [
        children.map((comp) => {
          const { _id, _selected, _expanded, _dragging, _parent, ...rest } =
            comp

          const templateComp: TemplateComponent = { ...rest }

          // Add nested components if this is a container
          if (
            comp.type === 1 ||
            comp.type === 2
          ) {
            const nestedChildren = buildComponentTree(comp._id)
            if (nestedChildren.length > 0) {
              templateComp.components = nestedChildren
            }
          }

          return templateComp
        }),
      ]
    }

    return {
      description: metadata.value.description,
      dataKey: metadata.value.dataKey,
      title: metadata.value.title,
      version: metadata.value.version,
      acronym: metadata.value.acronym,
      components: buildComponentTree(),
    }
  }

  // Import from template JSON
  function fromTemplateJSON(template: TemplateState): void {
    metadata.value = {
      description: template.description || '',
      dataKey: template.dataKey,
      title: template.title || '',
      version: template.version,
      acronym: template.acronym,
    }

    components.value = []

    const importComponents = (
      comps: TemplateComponent[][],
      parentId?: string
    ) => {
      for (const row of comps) {
        for (const comp of row) {
          const builderComp: BuilderComponent = {
            ...comp,
            _id: generateId(),
            _parent: parentId,
          }

          // Remove nested components from the object
          const { components: nested, ...rest } = builderComp
          components.value.push({ ...rest, _id: builderComp._id, _parent: parentId } as BuilderComponent)

          // Import nested components
          if (comp.components && comp.components.length > 0) {
            importComponents(comp.components, builderComp._id)
          }
        }
      }
    }

    if (template.components) {
      importComponents(template.components)
    }
  }

  // Clear all components
  function clear(): void {
    components.value = []
    metadata.value = {
      description: '',
      dataKey: 'new_form',
      title: 'New Form',
      version: '1.0.0',
    }
  }

  return {
    metadata,
    components,
    rootComponents,
    allDataKeys,
    getChildren,
    getComponent,
    getComponentByDataKey,
    addComponent,
    removeComponent,
    updateComponent,
    moveComponent,
    duplicateComponent,
    isDataKeyUnique,
    toTemplateJSON,
    fromTemplateJSON,
    clear,
  }
})
