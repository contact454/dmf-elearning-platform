'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-red-500 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Đã xảy ra lỗi
            </h2>
            
            <p className="text-red-600 mb-4">
              Xin lỗi, có gì đó không đúng. Vui lòng thử lại.
            </p>
            
            {this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm text-red-700 hover:text-red-800">
                  Chi tiết lỗi
                </summary>
                <pre className="mt-2 p-3 bg-red-100 rounded text-xs text-red-900 overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => this.setState({ hasError: false, error: null })}
                variant="outline"
              >
                Thử lại
              </Button>
              <Button
                onClick={() => window.location.href = '/dashboard'}
              >
                Về trang chủ
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
