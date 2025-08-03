import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import mermaid from 'mermaid'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github.css'
import '../styles/markdown.css'

interface MarkdownViewerProps {
  content: string
  className?: string
}

// Mermaid component for handling mermaid diagrams
function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      // Detect if we're in dark mode
      const isDark = document.documentElement.classList.contains('dark')
      
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        themeVariables: {
          primaryColor: '#3b82f6',
          primaryTextColor: '#111827',
          primaryBorderColor: '#1e40af',
          lineColor: isDark ? '#6b7280' : '#374151',
          secondaryColor: isDark ? '#1f2937' : '#f3f4f6',
          tertiaryColor: isDark ? '#374151' : '#e5e7eb',
          background: isDark ? '#111827' : '#ffffff',
          mainBkg: isDark ? '#1f2937' : '#f9fafb',
          secondBkg: isDark ? '#374151' : '#f3f4f6',
          tertiaryBkg: isDark ? '#4b5563' : '#e5e7eb',
          nodeTextColor: '#111827',
          textColor: '#111827',
          secondaryTextColor: '#111827',
          tertiaryTextColor: '#111827',
          edgeLabelBackground: '#ffffff',
          actorTextColor: '#111827',
          signalTextColor: '#111827'
        },
        flowchart: {
          useMaxWidth: false,
          htmlLabels: true,
          curve: 'basis',
          nodeSpacing: 50,
          rankSpacing: 50
        },
        sequence: {
          useMaxWidth: true,
          diagramMarginX: 50,
          diagramMarginY: 10,
          actorMargin: 50,
          width: 150,
          height: 65,
          boxMargin: 10,
          boxTextMargin: 5,
          noteMargin: 10,
          messageMargin: 35
        },
        gantt: {
          useMaxWidth: true,
        },
        gitgraph: {
          useMaxWidth: true
        }
      })

      const renderChart = async () => {
        try {
          // Clear previous content
          if (ref.current) {
            ref.current.innerHTML = ''
          }
          
          const elementId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const { svg } = await mermaid.render(elementId, chart)
          
          if (ref.current) {
            ref.current.innerHTML = svg
            // Apply custom styling to the SVG
            const svgElement = ref.current.querySelector('svg')
            if (svgElement) {
              svgElement.style.maxWidth = '90%'
              svgElement.style.height = 'auto'
              svgElement.style.background = 'transparent'
              svgElement.style.filter = 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))'
              
              // Add beautiful gradient definitions
              const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
              const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
              gradient.id = 'mindmapGradient'
              gradient.setAttribute('x1', '0%')
              gradient.setAttribute('y1', '0%')
              gradient.setAttribute('x2', '100%')
              gradient.setAttribute('y2', '100%')
              
              const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
              stop1.setAttribute('offset', '0%')
              stop1.setAttribute('stop-color', '#f8fafc')
              
              const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
              stop2.setAttribute('offset', '100%')
              stop2.setAttribute('stop-color', '#e2e8f0')
              
              gradient.appendChild(stop1)
              gradient.appendChild(stop2)
              defs.appendChild(gradient)
              svgElement.insertBefore(defs, svgElement.firstChild)
            }
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error)
          if (ref.current) {
            ref.current.innerHTML = `
              <div style="color: #ef4444; background: #1f1f1f; padding: 1rem; border-radius: 0.5rem; border: 1px solid #ef4444;">
                <strong>Mermaid Diagram Error:</strong><br/>
                ${error instanceof Error ? error.message : String(error)}
                <details style="margin-top: 0.5rem;">
                  <summary style="cursor: pointer;">Chart Code</summary>
                  <pre style="margin-top: 0.5rem; font-size: 0.875rem;">${chart}</pre>
                </details>
              </div>
            `
          }
        }
      }

      renderChart()
    }
  }, [chart])

  return <div ref={ref} className="mermaid my-4" />
}

export function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  // Initialize mermaid on component mount
  useEffect(() => {
    // Detect if we're in dark mode
    const isDark = document.documentElement.classList.contains('dark')
    
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#111827',
        primaryBorderColor: '#1e40af',
        lineColor: isDark ? '#6b7280' : '#374151',
        secondaryColor: isDark ? '#1f2937' : '#f3f4f6',
        tertiaryColor: isDark ? '#374151' : '#e5e7eb',
        background: isDark ? '#111827' : '#ffffff',
        mainBkg: isDark ? '#1f2937' : '#f9fafb',
        secondBkg: isDark ? '#374151' : '#f3f4f6',
        tertiaryBkg: isDark ? '#4b5563' : '#e5e7eb',
        nodeTextColor: '#111827',
        textColor: '#111827',
        secondaryTextColor: '#111827',
        tertiaryTextColor: '#111827',
        edgeLabelBackground: '#ffffff',
        actorTextColor: '#111827',
        signalTextColor: '#111827'
      }
    })
  }, [])

  return (
    <div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
        components={{
          // Enhanced code block component with mermaid support
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''

            if (!inline && language === 'mermaid') {
              return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />
            }

            if (!inline) {
              return (
                <pre className="relative">
                  <code className={className} {...props}>
                    {children}
                  </code>
                  {language && (
                    <span className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      {language}
                    </span>
                  )}
                </pre>
              )
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          
          // Enhanced table component
          table({ children }) {
            return (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full divide-y divide-gray-700">
                  {children}
                </table>
              </div>
            )
          },
          
          // Enhanced blockquote
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-950/20 italic">
                {children}
              </blockquote>
            )
          },
          
          // Enhanced headings with anchor links
          h1({ children }) {
            const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
            return (
              <h1 id={id} className="group flex items-center">
                {children}
                <a href={`#${id}`} className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  #
                </a>
              </h1>
            )
          },
          
          h2({ children }) {
            const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
            return (
              <h2 id={id} className="group flex items-center">
                {children}
                <a href={`#${id}`} className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  #
                </a>
              </h2>
            )
          },
          
          h3({ children }) {
            const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
            return (
              <h3 id={id} className="group flex items-center">
                {children}
                <a href={`#${id}`} className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  #
                </a>
              </h3>
            )
          },
          
          // Enhanced links
          a({ href, children }) {
            const isExternal = href?.startsWith('http')
            return (
              <a 
                href={href} 
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300"
              >
                {children}
                {isExternal && <span className="inline-block ml-1">↗</span>}
              </a>
            )
          },
          
          // Task list support
          li({ children, className }) {
            if (className?.includes('task-list-item')) {
              return <li className="flex items-start">{children}</li>
            }
            return <li>{children}</li>
          },
          
          // Enhanced images
          img({ src, alt, title }) {
            return (
              <figure className="my-6">
                <img 
                  src={src} 
                  alt={alt} 
                  title={title}
                  className="rounded-lg shadow-lg max-w-full h-auto"
                  loading="lazy"
                />
                {alt && (
                  <figcaption className="text-center text-sm text-gray-400 mt-2">
                    {alt}
                  </figcaption>
                )}
              </figure>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}