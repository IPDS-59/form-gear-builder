import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ValidationState, TestFunction, ValidationRule, ValidationType } from '@/types'
import { useTemplateStore } from './templateStore'

export const useValidationStore = defineStore('validation', () => {
  const templateStore = useTemplateStore()

  // Validation rules grouped by dataKey
  const testFunctions = ref<TestFunction[]>([])

  // Get validation rules for a specific component
  function getRulesForComponent(dataKey: string): ValidationRule[] {
    const testFunc = testFunctions.value.find((tf) => tf.dataKey === dataKey)
    return testFunc?.validations || []
  }

  // Add a validation rule to a component
  function addRule(
    dataKey: string,
    rule: ValidationRule
  ): void {
    let testFunc = testFunctions.value.find((tf) => tf.dataKey === dataKey)

    if (!testFunc) {
      testFunc = {
        dataKey,
        componentValidation: [dataKey],
        validations: [],
      }
      testFunctions.value.push(testFunc)
    }

    testFunc.validations.push(rule)
  }

  // Update a validation rule
  function updateRule(
    dataKey: string,
    ruleIndex: number,
    updates: Partial<ValidationRule>
  ): void {
    const testFunc = testFunctions.value.find((tf) => tf.dataKey === dataKey)
    if (testFunc && testFunc.validations[ruleIndex]) {
      testFunc.validations[ruleIndex] = {
        ...testFunc.validations[ruleIndex],
        ...updates,
      }
    }
  }

  // Remove a validation rule
  function removeRule(dataKey: string, ruleIndex: number): void {
    const testFunc = testFunctions.value.find((tf) => tf.dataKey === dataKey)
    if (testFunc) {
      testFunc.validations.splice(ruleIndex, 1)

      // Remove the test function if no rules left
      if (testFunc.validations.length === 0) {
        const index = testFunctions.value.indexOf(testFunc)
        testFunctions.value.splice(index, 1)
      }
    }
  }

  // Move a rule up/down
  function moveRule(
    dataKey: string,
    fromIndex: number,
    toIndex: number
  ): void {
    const testFunc = testFunctions.value.find((tf) => tf.dataKey === dataKey)
    if (testFunc && testFunc.validations[fromIndex]) {
      const [rule] = testFunc.validations.splice(fromIndex, 1)
      if (rule) {
        testFunc.validations.splice(toIndex, 0, rule)
      }
    }
  }

  // Update component validation (cross-component dependencies)
  function updateComponentValidation(
    dataKey: string,
    componentValidation: string[]
  ): void {
    const testFunc = testFunctions.value.find((tf) => tf.dataKey === dataKey)
    if (testFunc) {
      testFunc.componentValidation = componentValidation
    }
  }

  // Create a required rule
  function createRequiredRule(dataKey: string, message?: string): ValidationRule {
    return {
      test: `getValue('${dataKey}') == '' || getValue('${dataKey}') == null`,
      message: message || `${dataKey} is required`,
      type: 1 as ValidationType, // REQUIRED
    }
  }

  // Create a min length rule
  function createMinLengthRule(
    dataKey: string,
    minLength: number,
    message?: string
  ): ValidationRule {
    return {
      test: `getValue('${dataKey}').length < ${minLength}`,
      message: message || `Must be at least ${minLength} characters`,
      type: 2 as ValidationType, // ERROR
    }
  }

  // Create a max length rule
  function createMaxLengthRule(
    dataKey: string,
    maxLength: number,
    message?: string
  ): ValidationRule {
    return {
      test: `getValue('${dataKey}').length > ${maxLength}`,
      message: message || `Must be at most ${maxLength} characters`,
      type: 2 as ValidationType, // ERROR
    }
  }

  // Create a min value rule
  function createMinValueRule(
    dataKey: string,
    minValue: number,
    message?: string
  ): ValidationRule {
    return {
      test: `Number(getValue('${dataKey}')) < ${minValue}`,
      message: message || `Must be at least ${minValue}`,
      type: 2 as ValidationType, // ERROR
    }
  }

  // Create a max value rule
  function createMaxValueRule(
    dataKey: string,
    maxValue: number,
    message?: string
  ): ValidationRule {
    return {
      test: `Number(getValue('${dataKey}')) > ${maxValue}`,
      message: message || `Must be at most ${maxValue}`,
      type: 2 as ValidationType, // ERROR
    }
  }

  // Create a pattern rule
  function createPatternRule(
    dataKey: string,
    pattern: string,
    message?: string
  ): ValidationRule {
    return {
      test: `!/${pattern}/.test(getValue('${dataKey}'))`,
      message: message || `Invalid format`,
      type: 2 as ValidationType, // ERROR
    }
  }

  // Count total validation rules
  const totalRules = computed(() =>
    testFunctions.value.reduce((sum, tf) => sum + tf.validations.length, 0)
  )

  // Convert to validation JSON
  function toValidationJSON(): ValidationState {
    return {
      dataKey: templateStore.metadata.dataKey,
      version: templateStore.metadata.version,
      testFunctions: testFunctions.value,
    }
  }

  // Import from validation JSON
  function fromValidationJSON(validation: ValidationState): void {
    testFunctions.value = validation.testFunctions || []
  }

  // Clear all validation rules
  function clear(): void {
    testFunctions.value = []
  }

  // Sync validation rules when a component's dataKey changes
  function syncDataKeyChange(oldDataKey: string, newDataKey: string): void {
    const testFunc = testFunctions.value.find((tf) => tf.dataKey === oldDataKey)
    if (testFunc) {
      testFunc.dataKey = newDataKey

      // Update componentValidation array
      testFunc.componentValidation = testFunc.componentValidation.map((ck) =>
        ck === oldDataKey ? newDataKey : ck
      )

      // Update test expressions (simple replacement)
      testFunc.validations = testFunc.validations.map((rule) => ({
        ...rule,
        test: rule.test.replace(
          new RegExp(`'${oldDataKey}'`, 'g'),
          `'${newDataKey}'`
        ),
      }))
    }
  }

  // Alias methods for component usage
  function addValidationRule(dataKey: string, rule: ValidationRule): void {
    addRule(dataKey, rule)
  }

  function updateValidationRule(
    dataKey: string,
    ruleIndex: number,
    field: keyof ValidationRule,
    value: unknown
  ): void {
    updateRule(dataKey, ruleIndex, { [field]: value })
  }

  function removeValidationRule(dataKey: string, ruleIndex: number): void {
    removeRule(dataKey, ruleIndex)
  }

  return {
    testFunctions,
    totalRules,
    getRulesForComponent,
    addRule,
    updateRule,
    removeRule,
    moveRule,
    updateComponentValidation,
    createRequiredRule,
    createMinLengthRule,
    createMaxLengthRule,
    createMinValueRule,
    createMaxValueRule,
    createPatternRule,
    toValidationJSON,
    fromValidationJSON,
    clear,
    syncDataKeyChange,
    // Alias methods
    addValidationRule,
    updateValidationRule,
    removeValidationRule,
  }
})
