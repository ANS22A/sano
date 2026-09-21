import React from 'react'
import { cn } from '@/lib/utils/cn'

interface ArticleBodyProps {
  content: string | null
  className?: string
}

/**
 * A safe, dependency-free renderer for simple markdown-like text.
 * Escapes all HTML by default (via React).
 * Supports:
 * - ## or ### headings
 * - - or * bullet points
 * - empty lines for paragraphs
 * - **bold** text
 */
export function ArticleBody({ content, className }: ArticleBodyProps) {
  if (!content) return null

  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  
  let currentList: React.ReactNode[] = []

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-2 mb-6 ms-4 text-muted-foreground">
          {currentList}
        </ul>
      )
      currentList = []
    }
  }

  const renderBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  lines.forEach((line, index) => {
    const tLine = line.trim()
    
    // Empty line
    if (!tLine) {
      flushList()
      // Skip empty lines
      return
    }

    // Headings
    if (tLine.startsWith('### ')) {
      flushList()
      elements.push(
        <h3 key={index} className="text-xl font-heading font-bold text-foreground mt-8 mb-4">
          {renderBold(tLine.substring(4))}
        </h3>
      )
      return
    }
    
    if (tLine.startsWith('## ')) {
      flushList()
      elements.push(
        <h2 key={index} className="text-2xl font-heading font-bold text-foreground mt-10 mb-4">
          {renderBold(tLine.substring(3))}
        </h2>
      )
      return
    }

    // List items
    if (tLine.startsWith('- ') || tLine.startsWith('* ')) {
      currentList.push(
        <li key={index} className="leading-relaxed">
          {renderBold(tLine.substring(2))}
        </li>
      )
      return
    }

    // Regular paragraphs
    flushList()
    elements.push(
      <p key={index} className="mb-6 leading-relaxed text-muted-foreground">
        {renderBold(tLine)}
      </p>
    )
  })

  flushList()

  return (
    <div className={cn('article-content', className)}>
      {elements}
    </div>
  )
}
