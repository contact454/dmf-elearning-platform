'use client';

import { useState, ReactNode } from 'react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

interface MobileLayoutProps {
  children: ReactNode;
  feedbackPanel: ReactNode;
}

export function MobileLayout({ children, feedbackPanel }: MobileLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* Desktop: side-by-side */}
      <div className="hidden lg:flex h-screen">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        <div className="w-96">
          {feedbackPanel}
        </div>
      </div>

      {/* Mobile: bottom drawer */}
      <div className="lg:hidden relative min-h-screen flex flex-col">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {children}
        </div>

        {/* Bottom drawer toggle */}
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white py-3 shadow-lg flex items-center justify-center gap-2 z-40"
        >
          <span className="font-medium">Feedback</span>
          <ChevronUpIcon 
            className={`w-5 h-5 transition-transform ${isDrawerOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Bottom drawer */}
        <div
          className={`fixed bottom-12 left-0 right-0 h-96 bg-white dark:bg-gray-900 border-t dark:border-gray-700 shadow-2xl overflow-y-auto transition-transform duration-300 z-30 ${
            isDrawerOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {feedbackPanel}
        </div>

        {/* Backdrop */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}
      </div>
    </>
  );
}
