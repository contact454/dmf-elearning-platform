'use client';

export default function LoadingState() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Audio Player Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        {/* Main controls */}
        <div className="flex items-center gap-3">
          {/* Play button skeleton */}
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          
          {/* Progress bar skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-2 bg-gray-200 rounded-full" />
            <div className="flex justify-between">
              <div className="h-3 w-12 bg-gray-200 rounded" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Replay button skeleton */}
          <div className="w-8 h-8 bg-gray-200 rounded" />
        </div>

        {/* Secondary controls */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
          <div className="flex-1 flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <div className="flex-1 h-1.5 bg-gray-200 rounded" />
            <div className="w-8 h-3 bg-gray-200 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-3 w-12 bg-gray-200 rounded" />
            <div className="h-6 w-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        {/* Title */}
        <div className="h-6 w-64 bg-gray-200 rounded mx-auto" />
        
        {/* Subtitle */}
        <div className="h-4 w-48 bg-gray-200 rounded mx-auto" />

        {/* Content area */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>

        {/* Button */}
        <div className="h-12 bg-gray-200 rounded-lg w-full" />
      </div>

      {/* Loading Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">Loading exercise...</p>
      </div>
    </div>
  );
}
