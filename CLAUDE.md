# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build
```

## Architecture

FormGear Builder is a visual drag-and-drop template builder for the FormGear form engine. It's built with **Vue 3** (Composition API), **Pinia** for state management, and **Tailwind CSS v4**.

### Core Structure

```
src/
├── components/
│   ├── layout/          # ThreePanelLayout, Toolbar
│   ├── palette/         # ComponentPalette, DraggableComponent
│   ├── canvas/          # FormCanvas, CanvasComponent, DropZone
│   ├── properties/      # PropertiesPanel, property editors
│   └── preview/         # LivePreview (FormGear engine integration)
├── stores/
│   ├── templateStore.ts # Form template state (components, metadata)
│   ├── validationStore.ts # Validation rules state
│   └── uiStore.ts       # UI state (selection, panels, history)
├── types/
│   └── index.ts         # TypeScript types for components
└── utils/
    ├── componentDefaults.ts  # Default values for each component type
    └── jsonExporter.ts       # Export/import JSON utilities
```

### Component Types

All 38 FormGear component types are supported, identified by numeric codes:
- 1: Section, 2: Nested, 3: InnerHTML, 4: Variable
- 25: Text, 26: Radio, 27: Select, 28: Number, 29: Checkbox
- See `src/types/index.ts` for complete `ComponentType` enum

### Data Flow

1. User drags components from palette to canvas
2. `templateStore` manages component tree with parent-child relationships
3. `validationStore` manages validation rules per component
4. Properties panel edits selected component
5. Export generates `template.json` and `validation.json`

### Key Files

- **[src/stores/templateStore.ts](src/stores/templateStore.ts)** - Main template state, component CRUD, tree operations
- **[src/utils/componentDefaults.ts](src/utils/componentDefaults.ts)** - Default properties for each component type
- **[src/utils/jsonExporter.ts](src/utils/jsonExporter.ts)** - Export to FormGear-compatible JSON format
- **[src/components/canvas/DropZone.vue](src/components/canvas/DropZone.vue)** - Drag-and-drop target zones

### Output Format

The builder exports two JSON files compatible with FormGear 1.x and 2.x:

**template.json** - Form structure with nested components
**validation.json** - Validation rules with test expressions

### Patterns

- Components use `_id` (internal) and `dataKey` (user-facing identifier)
- Parent-child relationships tracked via `_parent` property
- Nested components (Section, Nested) contain child components array
- `enableCondition` uses JavaScript expressions with `getValue('dataKey')`
