'use client';

import { AlertCircle, RefreshCw, Mail } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ 
  message = 'Something went wrong while loading the exercise',
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="max-w-md w-full bg-white border border-red-200 rounded-lg p-8 text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">
            Oops! Something went wrong
          </h3>
          <p className="text-sm text-gray-600">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          )}
          
          <a
            href="mailto:support@dmf-elearning.de"
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            Contact Support
          </a>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500">
          If this problem persists, please contact our support team for assistance.
        </p>
      </div>
    </div>
  );
}
