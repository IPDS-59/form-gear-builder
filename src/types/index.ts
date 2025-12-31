/**
 * FormGear Builder Types
 *
 * TypeScript interfaces for the template builder.
 * These match the FormGear engine's expected JSON structures.
 */

// Component Type IDs (matching FormGear engine)
export enum ComponentType {
  SECTION = 1,
  NESTED = 2,
  INNER_HTML = 3,
  VARIABLE = 4,
  DATE = 11,
  DATETIME = 12,
  TIME = 13,
  MONTH = 14,
  WEEK = 15,
  SINGLE_CHECK = 16,
  TOGGLE = 17,
  RANGE_SLIDER = 18,
  URL = 19,
  CURRENCY = 20,
  LIST_TEXT_REPEAT = 21,
  LIST_SELECT_REPEAT = 22,
  MULTIPLE_SELECT = 23,
  MASKING = 24,
  TEXT = 25,
  RADIO = 26,
  SELECT = 27,
  NUMBER = 28,
  CHECKBOX = 29,
  TEXTAREA = 30,
  EMAIL = 31,
  PHOTO = 32,
  GPS = 33,
  CSV = 34,
  NOW = 35,
  SIGNATURE = 36,
  UNIT = 37,
  DECIMAL = 38,
}

// Validation Types
export enum ValidationType {
  REQUIRED = 1,
  ERROR = 2,
  WARNING = 3,
}

// Option Types
export enum OptionType {
  STATIC = 1,
  API = 2,
  REFERENCE = 3,
}

// Client Modes
export enum ClientMode {
  CAWI = 1,
  CAPI = 2,
  PAPI = 3,
}

// Option for select, radio, checkbox components
export interface Option {
  label: string
  value: string | number
  checkboxValue?: number
  open?: boolean
}

// Range input configuration
export interface RangeInput {
  min?: number | string
  max?: number | string
  step?: number
}

// Length input configuration
export interface LengthInput {
  min?: number
  max?: number
}

// Size input configuration (for file uploads)
export interface SizeInput {
  min?: number
  max?: number
}

// API source configuration
export interface SourceAPI {
  baseUrl: string
  value: string
  label: string
  data: string
  id?: string
  version?: string
  tableName?: string
  headers?: Record<string, string>
  filterDependencies?: Array<{
    params: string
    sourceAnswer: string
  }>
  subResourceDependencies?: Array<{
    params: string
    sourceAnswer: string
  }>
  parentCondition?: Array<{
    key: string
    value: string
  }>
}

// Validation rule
export interface ValidationRule {
  test: string
  message: string
  type: ValidationType
}

// Template component (used in template.json)
export interface TemplateComponent {
  // Required
  dataKey: string
  label: string
  type: ComponentType

  // Optional common
  name?: string
  description?: string
  hint?: string
  answer?: unknown
  required?: boolean
  disableInput?: boolean
  disableInitial?: boolean
  client?: ClientMode

  // Conditional rendering
  enableCondition?: string
  componentEnable?: string[]
  enableRemark?: boolean

  // Nested components
  components?: TemplateComponent[][]
  sourceQuestion?: string

  // Options
  options?: Option[]
  sourceOption?: string
  sourceAPI?: SourceAPI[]
  typeOption?: OptionType

  // Display
  rows?: number
  cols?: number
  principal?: number
  columnName?: string

  // Validation
  validations?: ValidationRule[]
  componentValidation?: string[]

  // Input constraints
  rangeInput?: RangeInput[]
  lengthInput?: LengthInput[]
  sizeInput?: SizeInput[]

  // Formatting
  currency?: string
  separatorFormat?: string
  isDecimal?: boolean
  decimalLength?: number
  maskingFormat?: string

  // Computed values
  expression?: string
  componentVar?: string[]
  render?: boolean
  renderType?: number

  // Modals
  titleModalDelete?: string
  contentModalDelete?: string
  titleModalConfirmation?: string
  contentModalConfirmation?: string

  // Other
  urlValidation?: string
}

// Template state (root of template.json)
export interface TemplateState {
  description: string
  dataKey: string
  title?: string
  acronym?: string
  version: string
  language?: Array<Record<string, string>>
  components: TemplateComponent[][]
}

// Test function for validation
export interface TestFunction {
  dataKey: string
  componentValidation: string[]
  validations: ValidationRule[]
}

// Validation state (root of validation.json)
export interface ValidationState {
  description?: string
  dataKey: string
  version?: string
  testFunctions: TestFunction[]
}

// Builder-specific component (extends TemplateComponent with UI state)
export interface BuilderComponent extends TemplateComponent {
  _id: string // Unique ID for drag-drop
  _selected?: boolean
  _expanded?: boolean
  _dragging?: boolean
  _parent?: string // Parent component ID
}

// Component category for palette
export interface ComponentCategory {
  name: string
  icon: string
  components: ComponentTypeInfo[]
}

// Component type info for palette
export interface ComponentTypeInfo {
  type: ComponentType
  name: string
  icon: string
  description: string
  defaultProps?: Partial<TemplateComponent>
}

// UI panel state
export interface PanelState {
  leftWidth: number
  rightWidth: number
  leftCollapsed: boolean
  rightCollapsed: boolean
}

// Form metadata
export interface FormMetadata {
  description: string
  dataKey: string
  title: string
  version: string
  acronym?: string
}
