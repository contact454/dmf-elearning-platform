'use client'

import { ReviewSession } from '@/components/vocabulary/ReviewSession'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function ReviewPage() {
  return (
    <ErrorBoundary>
      <div className="container mx-auto py-8">
        <ReviewSession />
      </div>
    </ErrorBoundary>
  )
}
