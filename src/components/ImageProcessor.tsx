'use client';

import { useState } from 'react';
import { ProcessedImage, ProcessingOptions } from '@/types';
import ProcessingControls from './ProcessingControls';
import ProcessingProgress from './ProcessingProgress';
import { processImages } from '@/utils/imageProcessor';

interface ImageProcessorProps {
  files: File[];
  onProcessingComplete: (results: ProcessedImage[]) => void;
  onStartProcessing: () => void;
  isProcessing: boolean;
}

export default function ImageProcessor({ 
  files, 
  onProcessingComplete, 
  onStartProcessing,
  isProcessing 
}: ImageProcessorProps) {
  const [options, setOptions] = useState<ProcessingOptions>({
    upscaleFactor: 2,
    targetFormat: 'jpeg',
    quality: 0.9,
    maintainAspectRatio: true,
    compressionLevel: 0.8
  });
  const [progress, setProgress] = useState({ current: 0, total: 0, currentFile: '', operation: '' });

  const handleStartProcessing = async () => {
    onStartProcessing();
    setProgress({ current: 0, total: files.length, currentFile: '', operation: 'Starting...' });
    
    try {
      const results = await processImages(files, options, setProgress);
      onProcessingComplete(results);
    } catch (error) {
      console.error('Processing failed:', error);
      alert('Processing failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Processing Options
        </h3>
        
        <div className="space-y-5">
          <ProcessingControls
            options={options}
            onOptionsChange={setOptions}
            disabled={isProcessing}
          />
        </div>
      </div>
      
      {(isProcessing || progress.current > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Processing Progress
          </h3>
          <ProcessingProgress
            progress={progress}
            total={files.length}
          />
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </div>
          
          <button
            onClick={handleStartProcessing}
            disabled={isProcessing || files.length === 0}
            className={`
              px-5 py-2 rounded-lg font-medium transition-all
              ${isProcessing || files.length === 0
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-md'
              }
            `}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : 'Start Processing'}
          </button>
        </div>
      </div>
    </div>
  );
}