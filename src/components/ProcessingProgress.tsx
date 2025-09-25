'use client';

import { ProcessingProgress as ProgressType } from '@/types';

interface ProcessingProgressProps {
  progress: ProgressType;
  total: number;
}

export default function ProcessingProgress({ progress, total }: ProcessingProgressProps) {
  const percentage = total > 0 ? (progress.current / total) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Processing Images
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {progress.current} / {total}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        {progress.currentFile && (
          <div>
            <span className="font-medium">Current:</span> {progress.currentFile}
          </div>
        )}
        {progress.operation && (
          <div>
            <span className="font-medium">Operation:</span> {progress.operation}
          </div>
        )}
      </div>
    </div>
  );
}