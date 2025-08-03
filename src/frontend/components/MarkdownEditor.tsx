import { useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { EditorView } from '@codemirror/view'
import { useApp } from '../contexts/AppContext'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function MarkdownEditor({ value, onChange, placeholder, className }: MarkdownEditorProps) {
  const { state } = useApp()
  const isDark = state.theme === 'dark'

  const handleChange = useCallback((val: string) => {
    onChange(val)
  }, [onChange])

  // Light theme configuration
  const lightTheme = EditorView.theme({
    '&': {
      color: '#374151',
      backgroundColor: 'transparent',
    },
    '.cm-content': {
      padding: '16px',
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      fontSize: '14px',
      lineHeight: '1.5',
      minHeight: '500px',
    },
    '.cm-focused': {
      outline: 'none',
    },
    '.cm-editor': {
      border: '1px solid rgb(209 213 219)',
      borderRadius: '6px',
      backgroundColor: 'rgb(255 255 255)',
    },
    '.cm-scroller': {
      fontFamily: 'inherit',
    },
    '.cm-line': {
      padding: '0 2px',
    },
    // Markdown syntax highlighting for light theme
    '.cm-header': {
      color: '#1e40af',
      fontWeight: 'bold',
    },
    '.cm-strong': {
      color: '#dc2626',
      fontWeight: 'bold',
    },
    '.cm-emphasis': {
      color: '#7c3aed',
      fontStyle: 'italic',
    },
    '.cm-strikethrough': {
      color: '#6b7280',
      textDecoration: 'line-through',
    },
    '.cm-link': {
      color: '#2563eb',
      textDecoration: 'underline',
    },
    '.cm-monospace': {
      color: '#dc2626',
      backgroundColor: 'rgb(243 244 246)',
      padding: '2px 4px',
      borderRadius: '3px',
      fontFamily: 'inherit',
    },
    '.cm-url': {
      color: '#059669',
    },
    '.cm-quote': {
      color: '#6b7280',
      fontStyle: 'italic',
      borderLeft: '3px solid #d1d5db',
      paddingLeft: '12px',
    },
    '.cm-list': {
      color: '#4338ca',
    },
    '.cm-atom': {
      color: '#7c2d12',
    },
  })

  // Dark theme configuration  
  const darkTheme = EditorView.theme({
    '&': {
      color: '#d1d5db',
      backgroundColor: 'rgb(31 41 55)',
    },
    '.cm-content': {
      padding: '16px',
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      fontSize: '14px',
      lineHeight: '1.5',
      minHeight: '500px',
      color: '#d1d5db',
      backgroundColor: 'rgb(31 41 55)',
    },
    '.cm-focused': {
      outline: 'none',
    },
    '.cm-editor': {
      border: '1px solid rgb(55 65 81)',
      borderRadius: '6px',
      backgroundColor: 'rgb(31 41 55)',
    },
    '.cm-scroller': {
      fontFamily: 'inherit',
      backgroundColor: 'rgb(31 41 55)',
    },
    '.cm-line': {
      padding: '0 2px',
      color: '#d1d5db',
    },
    // Markdown syntax highlighting for dark theme
    '.cm-header': {
      color: '#60a5fa',
      fontWeight: 'bold',
    },
    '.cm-strong': {
      color: '#f87171',
      fontWeight: 'bold',
    },
    '.cm-emphasis': {
      color: '#a78bfa',
      fontStyle: 'italic',
    },
    '.cm-strikethrough': {
      color: '#9ca3af',
      textDecoration: 'line-through',
    },
    '.cm-link': {
      color: '#3b82f6',
      textDecoration: 'underline',
    },
    '.cm-monospace': {
      color: '#fbbf24',
      backgroundColor: 'rgb(55 65 81)',
      padding: '2px 4px',
      borderRadius: '3px',
      fontFamily: 'inherit',
    },
    '.cm-url': {
      color: '#10b981',
    },
    '.cm-quote': {
      color: '#9ca3af',
      fontStyle: 'italic',
      borderLeft: '3px solid #4b5563',
      paddingLeft: '12px',
    },
    '.cm-list': {
      color: '#818cf8',
    },
    '.cm-atom': {
      color: '#f59e0b',
    },
    // Line number styling for dark mode
    '.cm-lineNumbers': {
      color: '#6b7280',
      backgroundColor: 'rgb(31 41 55)',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      color: '#6b7280',
    },
    '.cm-gutter': {
      backgroundColor: 'rgb(31 41 55)',
      borderRight: '1px solid rgb(55 65 81)',
    },
    // Cursor color in dark mode
    '.cm-cursor': {
      borderLeftColor: '#d1d5db',
    },
    // Selection colors
    '.cm-selectionBackground': {
      backgroundColor: 'rgba(59, 130, 246, 0.3)',
    },
    // Active line highlighting
    '.cm-activeLine': {
      backgroundColor: 'rgba(55, 65, 81, 0.5)',
    },
  })

  const extensions = [
    markdown(),
    EditorView.lineWrapping,
    isDark ? darkTheme : lightTheme,
  ]

  return (
    <div className={className}>
      <CodeMirror
        value={value}
        onChange={handleChange}
        extensions={extensions}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightSelectionMatches: false,
        }}
      />
    </div>
  )
}