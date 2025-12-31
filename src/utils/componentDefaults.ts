import {
  ComponentType,
  type BuilderComponent,
  type ComponentCategory,
  type ComponentTypeInfo,
} from '@/types'

// Generate unique ID
export function generateId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Generate unique dataKey
export function generateDataKey(type: ComponentType): string {
  const prefix = getComponentPrefix(type)
  return `${prefix}_${Math.random().toString(36).substr(2, 6)}`
}

// Get component prefix for dataKey
function getComponentPrefix(type: ComponentType): string {
  const prefixes: Record<number, string> = {
    [ComponentType.SECTION]: 'section',
    [ComponentType.NESTED]: 'nested',
    [ComponentType.INNER_HTML]: 'html',
    [ComponentType.VARIABLE]: 'var',
    [ComponentType.DATE]: 'date',
    [ComponentType.DATETIME]: 'datetime',
    [ComponentType.TIME]: 'time',
    [ComponentType.MONTH]: 'month',
    [ComponentType.WEEK]: 'week',
    [ComponentType.SINGLE_CHECK]: 'check',
    [ComponentType.TOGGLE]: 'toggle',
    [ComponentType.RANGE_SLIDER]: 'range',
    [ComponentType.URL]: 'url',
    [ComponentType.CURRENCY]: 'currency',
    [ComponentType.LIST_TEXT_REPEAT]: 'list_text',
    [ComponentType.LIST_SELECT_REPEAT]: 'list_select',
    [ComponentType.MULTIPLE_SELECT]: 'multi_select',
    [ComponentType.MASKING]: 'masked',
    [ComponentType.TEXT]: 'text',
    [ComponentType.RADIO]: 'radio',
    [ComponentType.SELECT]: 'select',
    [ComponentType.NUMBER]: 'number',
    [ComponentType.CHECKBOX]: 'checkbox',
    [ComponentType.TEXTAREA]: 'textarea',
    [ComponentType.EMAIL]: 'email',
    [ComponentType.PHOTO]: 'photo',
    [ComponentType.GPS]: 'gps',
    [ComponentType.CSV]: 'csv',
    [ComponentType.NOW]: 'now',
    [ComponentType.SIGNATURE]: 'signature',
    [ComponentType.UNIT]: 'unit',
    [ComponentType.DECIMAL]: 'decimal',
  }
  return prefixes[type] || 'field'
}

// Get component name
export function getComponentName(type: ComponentType): string {
  const names: Record<number, string> = {
    [ComponentType.SECTION]: 'Section',
    [ComponentType.NESTED]: 'Nested Group',
    [ComponentType.INNER_HTML]: 'HTML Content',
    [ComponentType.VARIABLE]: 'Variable',
    [ComponentType.DATE]: 'Date',
    [ComponentType.DATETIME]: 'Date & Time',
    [ComponentType.TIME]: 'Time',
    [ComponentType.MONTH]: 'Month',
    [ComponentType.WEEK]: 'Week',
    [ComponentType.SINGLE_CHECK]: 'Single Checkbox',
    [ComponentType.TOGGLE]: 'Toggle',
    [ComponentType.RANGE_SLIDER]: 'Range Slider',
    [ComponentType.URL]: 'URL',
    [ComponentType.CURRENCY]: 'Currency',
    [ComponentType.LIST_TEXT_REPEAT]: 'Text List',
    [ComponentType.LIST_SELECT_REPEAT]: 'Select List',
    [ComponentType.MULTIPLE_SELECT]: 'Multi-Select',
    [ComponentType.MASKING]: 'Masked Input',
    [ComponentType.TEXT]: 'Text Input',
    [ComponentType.RADIO]: 'Radio Group',
    [ComponentType.SELECT]: 'Dropdown',
    [ComponentType.NUMBER]: 'Number',
    [ComponentType.CHECKBOX]: 'Checkbox Group',
    [ComponentType.TEXTAREA]: 'Textarea',
    [ComponentType.EMAIL]: 'Email',
    [ComponentType.PHOTO]: 'Photo',
    [ComponentType.GPS]: 'GPS Location',
    [ComponentType.CSV]: 'CSV Upload',
    [ComponentType.NOW]: 'Timestamp',
    [ComponentType.SIGNATURE]: 'Signature',
    [ComponentType.UNIT]: 'Unit Input',
    [ComponentType.DECIMAL]: 'Decimal',
  }
  return names[type] || 'Unknown'
}

// Create default component
export function createDefaultComponent(type: ComponentType): BuilderComponent {
  const dataKey = generateDataKey(type)
  const name = getComponentName(type)

  const base: BuilderComponent = {
    _id: generateId(),
    dataKey,
    label: `New ${name}`,
    type,
  }

  // Add type-specific defaults
  switch (type) {
    case ComponentType.SECTION:
    case ComponentType.NESTED:
      // Container types
      break

    case ComponentType.RADIO:
    case ComponentType.SELECT:
    case ComponentType.CHECKBOX:
    case ComponentType.MULTIPLE_SELECT:
      base.options = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
      ]
      base.typeOption = 1 // STATIC
      break

    case ComponentType.LIST_TEXT_REPEAT:
    case ComponentType.LIST_SELECT_REPEAT:
      base.options = [
        { label: 'Item 1', value: '1' },
        { label: 'Item 2', value: '2' },
      ]
      break

    case ComponentType.TEXTAREA:
      base.rows = 4
      break

    case ComponentType.RANGE_SLIDER:
      base.rangeInput = [{ min: 0, max: 100, step: 1 }]
      break

    case ComponentType.CURRENCY:
      base.currency = 'USD'
      base.separatorFormat = 'en-US'
      break

    case ComponentType.DECIMAL:
      base.decimalLength = 2
      break

    case ComponentType.VARIABLE:
      base.expression = ''
      base.componentVar = []
      base.render = true
      base.renderType = 1
      break

    case ComponentType.MASKING:
      base.maskingFormat = '####-####'
      break
  }

  return base
}

// Component categories for palette (using emoji icons)
export const componentCategories: ComponentCategory[] = [
  {
    name: 'Layout',
    icon: '📐',
    components: [
      {
        type: ComponentType.SECTION,
        name: 'Section',
        icon: '📦',
        description: 'Container for grouping components',
      },
      {
        type: ComponentType.NESTED,
        name: 'Nested Group',
        icon: '🔁',
        description: 'Repeating group of components',
      },
    ],
  },
  {
    name: 'Display',
    icon: '👁️',
    components: [
      {
        type: ComponentType.INNER_HTML,
        name: 'HTML Content',
        icon: '🌐',
        description: 'Display raw HTML content',
      },
      {
        type: ComponentType.VARIABLE,
        name: 'Variable',
        icon: '🔢',
        description: 'Computed value from expression',
      },
    ],
  },
  {
    name: 'Text Input',
    icon: '✏️',
    components: [
      {
        type: ComponentType.TEXT,
        name: 'Text',
        icon: '📝',
        description: 'Single line text input',
      },
      {
        type: ComponentType.TEXTAREA,
        name: 'Textarea',
        icon: '📄',
        description: 'Multi-line text input',
      },
      {
        type: ComponentType.EMAIL,
        name: 'Email',
        icon: '📧',
        description: 'Email address input',
      },
      {
        type: ComponentType.URL,
        name: 'URL',
        icon: '🔗',
        description: 'URL input',
      },
      {
        type: ComponentType.MASKING,
        name: 'Masked',
        icon: '#️⃣',
        description: 'Masked format input',
      },
    ],
  },
  {
    name: 'Number Input',
    icon: '🔢',
    components: [
      {
        type: ComponentType.NUMBER,
        name: 'Number',
        icon: '🔢',
        description: 'Integer input',
      },
      {
        type: ComponentType.DECIMAL,
        name: 'Decimal',
        icon: '➗',
        description: 'Decimal number input',
      },
      {
        type: ComponentType.CURRENCY,
        name: 'Currency',
        icon: '💰',
        description: 'Currency input with formatting',
      },
      {
        type: ComponentType.RANGE_SLIDER,
        name: 'Range Slider',
        icon: '📊',
        description: 'Range slider input',
      },
    ],
  },
  {
    name: 'Date & Time',
    icon: '📅',
    components: [
      {
        type: ComponentType.DATE,
        name: 'Date',
        icon: '📅',
        description: 'Date picker',
      },
      {
        type: ComponentType.DATETIME,
        name: 'Date & Time',
        icon: '📆',
        description: 'DateTime picker',
      },
      {
        type: ComponentType.TIME,
        name: 'Time',
        icon: '⏰',
        description: 'Time picker',
      },
      {
        type: ComponentType.MONTH,
        name: 'Month',
        icon: '🗓️',
        description: 'Month picker',
      },
      {
        type: ComponentType.WEEK,
        name: 'Week',
        icon: '📆',
        description: 'Week picker',
      },
      {
        type: ComponentType.NOW,
        name: 'Timestamp',
        icon: '⏱️',
        description: 'Current timestamp',
      },
    ],
  },
  {
    name: 'Selection',
    icon: '📋',
    components: [
      {
        type: ComponentType.RADIO,
        name: 'Radio',
        icon: '🔘',
        description: 'Radio button group',
      },
      {
        type: ComponentType.SELECT,
        name: 'Dropdown',
        icon: '📥',
        description: 'Dropdown select',
      },
      {
        type: ComponentType.CHECKBOX,
        name: 'Checkbox',
        icon: '☑️',
        description: 'Checkbox group',
      },
      {
        type: ComponentType.MULTIPLE_SELECT,
        name: 'Multi-Select',
        icon: '✅',
        description: 'Multi-select checkboxes',
      },
      {
        type: ComponentType.SINGLE_CHECK,
        name: 'Single Check',
        icon: '✓',
        description: 'Single checkbox toggle',
      },
      {
        type: ComponentType.TOGGLE,
        name: 'Toggle',
        icon: '🔀',
        description: 'Toggle switch',
      },
    ],
  },
  {
    name: 'List Repeats',
    icon: '📑',
    components: [
      {
        type: ComponentType.LIST_TEXT_REPEAT,
        name: 'Text List',
        icon: '📋',
        description: 'Repeating text list',
      },
      {
        type: ComponentType.LIST_SELECT_REPEAT,
        name: 'Select List',
        icon: '📑',
        description: 'Repeating select list',
      },
    ],
  },
  {
    name: 'Media',
    icon: '📷',
    components: [
      {
        type: ComponentType.PHOTO,
        name: 'Photo',
        icon: '📷',
        description: 'Photo capture',
      },
      {
        type: ComponentType.GPS,
        name: 'GPS',
        icon: '📍',
        description: 'GPS location',
      },
      {
        type: ComponentType.CSV,
        name: 'CSV',
        icon: '📊',
        description: 'CSV file upload',
      },
      {
        type: ComponentType.SIGNATURE,
        name: 'Signature',
        icon: '✍️',
        description: 'Signature capture',
      },
    ],
  },
  {
    name: 'Special',
    icon: '⚙️',
    components: [
      {
        type: ComponentType.UNIT,
        name: 'Unit',
        icon: '⚖️',
        description: 'Unit selection with conversion',
      },
    ],
  },
]

// Get component info by type
export function getComponentInfo(type: ComponentType): ComponentTypeInfo | undefined {
  for (const category of componentCategories) {
    const found = category.components.find((c: ComponentTypeInfo) => c.type === type)
    if (found) return found
  }
  return undefined
}

// Check if a component can have children
export function canHaveChildren(type: ComponentType): boolean {
  return type === ComponentType.SECTION || type === ComponentType.NESTED
}

// Check if a component type needs options
export function needsOptions(type: ComponentType): boolean {
  return [
    ComponentType.RADIO,
    ComponentType.SELECT,
    ComponentType.CHECKBOX,
    ComponentType.MULTIPLE_SELECT,
    ComponentType.LIST_TEXT_REPEAT,
    ComponentType.LIST_SELECT_REPEAT,
  ].includes(type)
}

// Check if a component can be nested
export function canBeNested(type: ComponentType): boolean {
  // Most components can be nested except SECTION
  return type !== ComponentType.SECTION
}
