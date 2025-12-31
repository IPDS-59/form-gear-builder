import type { TemplateState, ValidationState } from '@/types'

// Export template JSON as string
export function exportTemplateJSON(template: TemplateState): string {
  return JSON.stringify(template, null, 2)
}

// Export validation JSON as string
export function exportValidationJSON(validation: ValidationState): string {
  return JSON.stringify(validation, null, 2)
}

// Download JSON as file
export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Download template and validation as zip
export async function downloadAsZip(
  template: TemplateState,
  validation: ValidationState
): Promise<void> {
  // For now, just download as separate files
  // Could use JSZip library for actual zip
  downloadJSON(exportTemplateJSON(template), 'template.json')
  setTimeout(() => {
    downloadJSON(exportValidationJSON(validation), 'validation.json')
  }, 100)
}

// Parse JSON file
export function parseJSONFile<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content) as T
        resolve(data)
      } catch (error) {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// Validate template JSON structure
export function validateTemplateJSON(data: unknown): data is TemplateState {
  if (!data || typeof data !== 'object') return false

  const template = data as Record<string, unknown>

  // Required fields
  if (typeof template.dataKey !== 'string') return false
  if (typeof template.version !== 'string') return false
  if (!Array.isArray(template.components)) return false

  return true
}

// Validate validation JSON structure
export function validateValidationJSON(data: unknown): data is ValidationState {
  if (!data || typeof data !== 'object') return false

  const validation = data as Record<string, unknown>

  // Required fields
  if (typeof validation.dataKey !== 'string') return false
  if (!Array.isArray(validation.testFunctions)) return false

  return true
}
