'use client';

import { useEffect, useState, RefObject } from 'react';
import type { GrammarError } from '@/types/writing';

interface ErrorOverlayProps {
  errors: GrammarError[];
  contentRef: RefObject<HTMLDivElement>;
}

interface HighlightPosition {
  error: GrammarError;
  rect: DOMRect;
}

export function ErrorOverlay({ errors, contentRef }: ErrorOverlayProps) {
  const [highlights, setHighlights] = useState<HighlightPosition[]>([]);

  useEffect(() => {
    if (!contentRef.current) return;

    const contentEl = contentRef.current;
    const text = contentEl.innerText;

    // Simple text highlighting (production would use more sophisticated approach)
    const newHighlights: HighlightPosition[] = [];

    errors.forEach((error) => {
      try {
        const range = document.createRange();
        const textNodes = getTextNodesIn(contentEl);
        
        let currentOffset = 0;
        for (const node of textNodes) {
          const nodeLength = (node.textContent || '').length;
          
          if (currentOffset + nodeLength >= error.offset) {
            const startOffset = Math.max(0, error.offset - currentOffset);
            const endOffset = Math.min(nodeLength, error.offset + error.length - currentOffset);
            
            if (startOffset < nodeLength) {
              range.setStart(node, startOffset);
              range.setEnd(node, Math.min(endOffset, nodeLength));
              
              const rect = range.getBoundingClientRect();
              const containerRect = contentEl.getBoundingClientRect();

              newHighlights.push({
                error,
                rect: new DOMRect(
                  rect.left - containerRect.left,
                  rect.top - containerRect.top,
                  rect.width,
                  rect.height
                ),
              });
              break;
            }
          }
          
          currentOffset += nodeLength;
        }
      } catch (err) {
        console.warn('Error highlighting text:', err);
      }
    });

    setHighlights(newHighlights);
  }, [errors, contentRef]);

  const getUnderlineColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'border-red-500';
      case 'spelling': return 'border-blue-500';
      case 'style': return 'border-orange-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {highlights.map(({ error, rect }, idx) => (
        <div
          key={`${error.id}-${idx}`}
          className={`absolute border-b-2 ${getUnderlineColor(error.type)}`}
          style={{
            left: rect.left,
            top: rect.top + rect.height - 2,
            width: rect.width,
            height: 2,
          }}
          title={error.message}
        />
      ))}
    </div>
  );
}

// Helper to get all text nodes in an element
function getTextNodesIn(node: Node): Text[] {
  const textNodes: Text[] = [];
  
  if (node.nodeType === Node.TEXT_NODE) {
    textNodes.push(node as Text);
  } else {
    for (let i = 0; i < node.childNodes.length; i++) {
      textNodes.push(...getTextNodesIn(node.childNodes[i]));
    }
  }
  
  return textNodes;
}
