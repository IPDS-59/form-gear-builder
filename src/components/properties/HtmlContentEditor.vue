<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Register HTML/XML language
hljs.registerLanguage('xml', xml)

const props = defineProps<{
  modelValue: string
  visible: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:visible': [value: boolean]
  save: [value: string]
}>()

// Local content state
const content = ref('')
const previewRef = ref<HTMLIFrameElement | null>(null)
const editorRef = ref<HTMLTextAreaElement | null>(null)
const highlightRef = ref<HTMLPreElement | null>(null)

// Syntax highlighting using highlight.js
function highlightHtml(html: string): string {
  if (!html) return ''

  try {
    const result = hljs.highlight(html, { language: 'xml' })
    return result.value
  } catch {
    // Fallback: just escape HTML
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }
}

// Computed highlighted content
const highlightedContent = computed(() => highlightHtml(content.value))

// Sync scroll between textarea and highlight overlay
function syncScroll() {
  if (editorRef.value && highlightRef.value) {
    highlightRef.value.scrollTop = editorRef.value.scrollTop
    highlightRef.value.scrollLeft = editorRef.value.scrollLeft
  }
}

// HTML Beautifier - formats minified HTML for editing
function beautifyHtml(html: string): string {
  if (!html || !html.trim()) return html

  let formatted = ''
  let indent = 0
  const indentStr = '  ' // 2 spaces

  // Self-closing and inline tags that shouldn't add newlines
  const inlineTags = ['a', 'span', 'strong', 'em', 'b', 'i', 'u', 'small', 'big', 'code', 'sub', 'sup', 'label', 'br', 'img', 'input']
  const selfClosingTags = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr']

  // Normalize whitespace first
  html = html.replace(/\s+/g, ' ').trim()

  // Split by tags while keeping the tags
  const tokens = html.split(/(<\/?[^>]+>)/g).filter(t => t.trim())

  let prevWasInline = false

  for (const token of tokens) {
    const trimmed = token.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('</')) {
      // Closing tag
      const tagName = trimmed.match(/<\/(\w+)/)?.[1]?.toLowerCase() || ''
      if (!inlineTags.includes(tagName)) {
        indent = Math.max(0, indent - 1)
        formatted += '\n' + indentStr.repeat(indent) + trimmed
        prevWasInline = false
      } else {
        formatted += trimmed
        prevWasInline = true
      }
    } else if (trimmed.startsWith('<')) {
      // Opening tag or self-closing
      const tagName = trimmed.match(/<(\w+)/)?.[1]?.toLowerCase() || ''
      const isSelfClosing = selfClosingTags.includes(tagName) || trimmed.endsWith('/>')

      if (inlineTags.includes(tagName)) {
        if (!prevWasInline && formatted) {
          formatted += '\n' + indentStr.repeat(indent)
        }
        formatted += trimmed
        prevWasInline = true
      } else {
        if (formatted) {
          formatted += '\n' + indentStr.repeat(indent)
        }
        formatted += trimmed
        if (!isSelfClosing) {
          indent++
        }
        prevWasInline = false
      }
    } else {
      // Text content
      if (prevWasInline) {
        formatted += trimmed
      } else if (trimmed) {
        formatted += '\n' + indentStr.repeat(indent) + trimmed
      }
      prevWasInline = true
    }
  }

  return formatted.trim()
}

// HTML Minifier - removes unnecessary whitespace for storage
function minifyHtml(html: string): string {
  if (!html || !html.trim()) return html

  return html
    // Remove comments (but keep conditional comments)
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
    // Remove whitespace between tags
    .replace(/>\s+</g, '><')
    // Collapse multiple spaces to single space
    .replace(/\s{2,}/g, ' ')
    // Remove leading/trailing whitespace from lines
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .join('')
    .trim()
}

// When editor opens, beautify the content for editing
watch(() => props.visible, async (isVisible) => {
  if (isVisible) {
    // Beautify when opening
    content.value = beautifyHtml(props.modelValue || '')
    // Wait for DOM then update preview
    await nextTick()
    setTimeout(updatePreview, 50)
  }
}, { immediate: true })

// Update preview when content changes
watch(content, () => {
  updatePreview()
})

// Update preview iframe
function updatePreview() {
  if (!previewRef.value) return

  const doc = previewRef.value.contentDocument
  if (!doc) return

  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <!-- Tailwind CSS CDN -->
      <script src="https://cdn.tailwindcss.com"><\/script>
      <!-- Google Fonts - Montserrat -->
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
      <!-- FormGear CSS -->
      <link rel="stylesheet" href="/form-gear.css">
      <style>
        body {
          font-family: 'Montserrat', sans-serif;
          padding: 1rem;
          line-height: 1.6;
          color: #374151;
        }
      </style>
    </head>
    <body>${content.value}</body>
    </html>
  `)
  doc.close()
}

// Handle save - minify HTML for storage
function handleSave() {
  const minified = minifyHtml(content.value)
  emit('update:modelValue', minified)
  emit('save', minified)
  emit('update:visible', false)
}

// Handle cancel
function handleCancel() {
  content.value = props.modelValue || ''
  emit('update:visible', false)
}

// Handle dialog open state change
function handleOpenChange(open: boolean) {
  if (!open) {
    handleCancel()
  }
}

// Insert HTML snippet
function insertSnippet(snippet: string) {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = content.value

  content.value = text.substring(0, start) + snippet + text.substring(end)

  // Restore cursor position
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + snippet.length, start + snippet.length)
  }, 0)
}

// Format button handler
function formatCode() {
  content.value = beautifyHtml(content.value)
}

// Common snippets
const snippets = [
  { label: 'Heading 1', snippet: '<h1>Heading</h1>' },
  { label: 'Heading 2', snippet: '<h2>Heading</h2>' },
  { label: 'Heading 3', snippet: '<h3>Heading</h3>' },
  { label: 'Paragraph', snippet: '<p>Your text here...</p>' },
  { label: 'Bold', snippet: '<strong>bold text</strong>' },
  { label: 'Italic', snippet: '<em>italic text</em>' },
  { label: 'Link', snippet: '<a href="https://example.com">Link text</a>' },
  { label: 'Image', snippet: '<img src="image-url.jpg" alt="Description">' },
  { label: 'List (UL)', snippet: '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>' },
  { label: 'List (OL)', snippet: '<ol>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ol>' },
  { label: 'Table', snippet: '<table>\n  <thead>\n    <tr>\n      <th>Header 1</th>\n      <th>Header 2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Cell 1</td>\n      <td>Cell 2</td>\n    </tr>\n  </tbody>\n</table>' },
  { label: 'Blockquote', snippet: '<blockquote>Quote text here...</blockquote>' },
  { label: 'Code', snippet: '<code>inline code</code>' },
  { label: 'Code Block', snippet: '<pre><code>// Code block\nconst x = 1;</code></pre>' },
  { label: 'Div', snippet: '<div class="custom-class">\n  Content here...\n</div>' },
  { label: 'Span', snippet: '<span style="color: #3b82f6;">styled text</span>' },
]

// Keyboard shortcuts
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    handleCancel()
  } else if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    handleSave()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  setTimeout(updatePreview, 100)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Dialog :open="visible" @update:open="handleOpenChange">
    <DialogContent
      class="w-[95vw] h-[90vh] max-w-none sm:max-w-[95vw] p-0 gap-0 flex flex-col"
      :show-close-button="false"
    >
      <!-- Header -->
      <DialogHeader class="flex flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 space-y-0">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <div>
            <DialogTitle>HTML Content Editor</DialogTitle>
            <DialogDescription class="text-xs">
              Press Ctrl+S to save, Esc to cancel
            </DialogDescription>
          </div>
        </div>

        <button
          @click="handleCancel"
          class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </DialogHeader>

      <!-- Toolbar -->
      <div class="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 overflow-x-auto">
        <!-- Format button -->
        <button
          @click="formatCode"
          class="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded whitespace-nowrap transition-colors flex items-center gap-1 border border-blue-200 dark:border-blue-700 mr-2"
          title="Format HTML code"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          Format
        </button>
        <div class="w-px h-5 bg-gray-300 dark:bg-gray-600 mr-2"></div>
        <span class="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2 shrink-0">Insert:</span>
        <button
          v-for="item in snippets"
          :key="item.label"
          @click="insertSnippet(item.snippet)"
          class="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded whitespace-nowrap transition-colors"
        >
          {{ item.label }}
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Editor with Syntax Highlighting -->
        <div class="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700">
          <div class="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">HTML Code</span>
          </div>
          <div class="flex-1 relative overflow-hidden">
            <!-- Syntax highlighted overlay -->
            <pre
              ref="highlightRef"
              class="absolute inset-0 p-4 font-mono text-sm bg-gray-900 overflow-auto pointer-events-none whitespace-pre-wrap break-words m-0"
              aria-hidden="true"
              v-html="highlightedContent + '\n'"
            ></pre>
            <!-- Transparent textarea for input -->
            <textarea
              ref="editorRef"
              v-model="content"
              @scroll="syncScroll"
              class="html-editor-textarea absolute inset-0 w-full h-full p-4 font-mono text-sm bg-transparent text-transparent caret-white resize-none focus:outline-none z-10"
              placeholder="Enter your HTML content here..."
              spellcheck="false"
            ></textarea>
            <!-- Placeholder when empty -->
            <div
              v-if="!content"
              class="absolute top-4 left-4 text-gray-500 font-mono text-sm pointer-events-none"
            >
              Enter your HTML content here...
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="flex-1 flex flex-col">
          <div class="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Preview</span>
          </div>
          <iframe
            ref="previewRef"
            class="flex-1 w-full bg-white"
            title="HTML Preview"
          ></iframe>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div class="text-xs text-gray-500 dark:text-gray-400">
          {{ content.length }} characters
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" @click="handleCancel">
            Cancel
          </Button>
          <Button @click="handleSave">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Save Content
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* highlight.js theme - VS Code Dark+ inspired */
:deep(.hljs-tag) {
  color: #808080;
}

:deep(.hljs-name) {
  color: #569cd6;
}

:deep(.hljs-attr) {
  color: #9cdcfe;
}

:deep(.hljs-string) {
  color: #ce9178;
}

:deep(.hljs-comment) {
  color: #6a9955;
  font-style: italic;
}

:deep(.hljs-doctag) {
  color: #569cd6;
}

:deep(.hljs-meta) {
  color: #569cd6;
}

:deep(.hljs-keyword) {
  color: #569cd6;
}

:deep(.hljs-symbol) {
  color: #b5cea8;
}

/* Ensure pre and textarea have matching styles */
.html-editor-textarea,
pre {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  tab-size: 2;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Base text color for highlighted code */
pre {
  color: #d4d4d4;
}
</style>
