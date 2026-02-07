'use client';

import { useState, ReactNode } from 'react';
import { ChevronUp, X } from 'lucide-react';

interface MobileLayoutProps {
  children: ReactNode;
  feedbackPanel?: ReactNode;
  showFeedbackPanel?: boolean;
  className?: string;
}

export function MobileLayout({
  children,
  feedbackPanel,
  showFeedbackPanel = true,
  className = '',
}: MobileLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* Desktop: side-by-side (lg breakpoint = 1024px) */}
      <div className={`hidden lg:flex h-screen ${className}`}>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        {showFeedbackPanel && feedbackPanel && (
          <div className="w-96 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {feedbackPanel}
          </div>
        )}
      </div>

      {/* Mobile & Tablet: bottom drawer */}
      <div className={`lg:hidden relative min-h-screen flex flex-col ${className}`}>
        {/* Main content */}
        <div className={`flex-1 overflow-y-auto ${showFeedbackPanel && feedbackPanel ? 'pb-16' : ''}`}>
          {children}
        </div>

        {/* Bottom drawer toggle button */}
        {showFeedbackPanel && feedbackPanel && (
          <>
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="fixed bottom-0 left-0 right-0 bg-blue-600 hover:bg-blue-700 text-white py-3 shadow-lg flex items-center justify-center gap-2 z-40 transition-colors"
              aria-label="Toggle feedback panel"
            >
              <span className="font-medium text-sm">
                {isDrawerOpen ? 'Close Feedback' : 'View Feedback'}
              </span>
              <ChevronUp
                className={`w-5 h-5 transition-transform duration-300 ${
                  isDrawerOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Bottom drawer */}
            <div
              className={`fixed bottom-12 left-0 right-0 h-[80vh] bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700 shadow-2xl overflow-y-auto transition-transform duration-300 z-30 ${
                isDrawerOpen ? 'translate-y-0' : 'translate-y-full'
              }`}
            >
              {/* Drawer Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Feedback
                </h3>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close feedback panel"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-4">
                {feedbackPanel}
              </div>
            </div>

            {/* Backdrop */}
            {isDrawerOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity"
                onClick={() => setIsDrawerOpen(false)}
                aria-hidden="true"
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
