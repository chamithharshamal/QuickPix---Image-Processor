'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ImageProcessor from '@/components/ImageProcessor';
import ProcessingQueue from '@/components/ProcessingQueue';
import MetadataSection from '@/components/MetadataSection';
import { ProcessedImage } from '@/types';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'processor' | 'metadata'>('processor');
  const [showMemoryWarning, setShowMemoryWarning] = useState(true);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const handleProcessingComplete = (results: ProcessedImage[]) => {
    setProcessedImages(results);
    setIsProcessing(false);
  };

  const handleStartProcessing = () => {
    setIsProcessing(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6">
        {/* Memory warning banner */}
        {showMemoryWarning && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Memory Usage Warning</h3>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Processing multiple images or using upscaling features may cause high memory usage. 
                    For best performance, process fewer than 5 images at a time and avoid upscaling.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowMemoryWarning(false)}
                className="text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            QuickPix
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Process images entirely in your browser - upscale, convert, resize, compress, and more. 
            No server storage required for maximum privacy.
          </p>
        </header>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          {/* Tab Navigation */}
          <div className="flex justify-center border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab('processor')}
              className={`py-3 px-6 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === 'processor'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Image Processing
              </div>
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`py-3 px-6 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === 'metadata'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Metadata Viewer
              </div>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'processor' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Images
                  </h2>
                  <FileUpload 
                    onFilesSelected={handleFilesSelected}
                    disabled={isProcessing}
                  />
                </div>
                
                {files.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Processing Options
                    </h2>
                    <ImageProcessor
                      files={files}
                      onProcessingComplete={handleProcessingComplete}
                      onStartProcessing={handleStartProcessing}
                      isProcessing={isProcessing}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Processing Queue
                  </h2>
                  <ProcessingQueue
                    processedImages={processedImages}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <MetadataSection />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 dark:text-gray-400 text-sm pb-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <p>© {new Date().getFullYear()} QuickPix - All rights reserved</p>
            <div className="hidden md:block w-1 h-1 bg-gray-400 rounded-full"></div>
            <p>All processing happens locally in your browser</p>
          </div>
        </footer>
      </div>
    </div>
  );
}