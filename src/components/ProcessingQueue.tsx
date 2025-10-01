'use client';

import { useState, useEffect } from 'react';
import { ProcessedImage } from '@/types';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

interface ProcessingQueueProps {
  processedImages: ProcessedImage[];
  isProcessing: boolean;
}

export default function ProcessingQueue({ processedImages, isProcessing }: ProcessingQueueProps) {
  const [downloading, setDownloading] = useState(false);
  const [expandedImageId, setExpandedImageId] = useState<string | null>(null);

  // Clean up blob URLs when processedImages change or component unmounts
  useEffect(() => {
    // Clean up function
    return () => {
      processedImages.forEach(image => {
        try {
          URL.revokeObjectURL(image.processedUrl);
        } catch (error) {
          console.warn('Failed to revoke object URL:', error);
        }
      });
    };
  }, [processedImages]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadSingle = (image: ProcessedImage) => {
    const extension = image.targetFormat;
    const filename = `${image.originalFile.name.split('.')[0]}_processed.${extension}`;
    saveAs(image.processedBlob, filename);
  };

  const downloadAll = async () => {
    if (processedImages.length === 0) return;
    
    setDownloading(true);
    try {
      const zip = new JSZip();
      
      for (const image of processedImages) {
        const extension = image.targetFormat;
        const filename = `${image.originalFile.name.split('.')[0]}_processed.${extension}`;
        zip.file(filename, image.processedBlob);
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'processed_images.zip');
    } catch (error) {
      console.error('Error creating ZIP:', error);
      alert('Error creating ZIP file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const toggleExpand = (imageId: string) => {
    setExpandedImageId(expandedImageId === imageId ? null : imageId);
  };

  if (processedImages.length === 0 && !isProcessing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Processed Images
        </h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-medium text-gray-900 dark:text-white">No processed images yet</p>
          <p className="text-sm">Upload and process images to see results here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Processed Images ({processedImages.length})
          </h3>
          {processedImages.length > 0 && (
            <button
              onClick={downloadAll}
              disabled={downloading}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all text-sm
                ${downloading
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow hover:shadow-md'
                }
              `}
            >
              {downloading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating ZIP...
                </div>
              ) : 'Download All (ZIP)'}
            </button>
          )}
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {processedImages.map((image) => (
            <div
              key={image.id}
              className="bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
            >
              <div 
                className="flex items-center space-x-4 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => toggleExpand(image.id)}
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={image.processedUrl} 
                      alt={image.originalFile.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Error loading thumbnail image:', e);
                        console.log('Blob size:', image.processedBlob.size);
                        console.log('Blob type:', image.processedBlob.type);
                        console.log('Processed URL:', image.processedUrl);
                        // Set a fallback image or hide the element
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        console.log('Thumbnail image loaded successfully');
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {image.originalFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {image.operation} • {formatFileSize(image.processedSize)} 
                    {image.originalSize !== image.processedSize && (
                      <span className={`ml-1 ${
                        image.processedSize < image.originalSize ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        ({image.processedSize < image.originalSize ? '-' : '+'}
                        {Math.round(Math.abs(image.processedSize - image.originalSize) / image.originalSize * 100)}%)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Processed in {image.processingTime}ms
                  </p>
                </div>
                
                <div className="flex-shrink-0 flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadSingle(image);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                  >
                    Download
                  </button>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform ${expandedImageId === image.id ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Expanded Preview */}
              {expandedImageId === image.id && (
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <img 
                        src={image.processedUrl} 
                        alt="Processed preview" 
                        className="max-h-64 mx-auto object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          console.error('Error loading expanded image:', e);
                          console.log('Blob size:', image.processedBlob.size);
                          console.log('Blob type:', image.processedBlob.type);
                          console.log('Processed URL:', image.processedUrl);
                          // Set a fallback image or hide the element
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                        onLoad={(e) => {
                          console.log('Expanded image loaded successfully');
                        }}
                      />
                    </div>
                    
                    <div className="md:w-64">
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Operation:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{image.operation}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Original Size:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{formatFileSize(image.originalSize)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Processed Size:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{formatFileSize(image.processedSize)}</span>
                            {image.originalSize !== image.processedSize && (
                              <span className={`ml-2 ${
                                image.processedSize < image.originalSize ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                              }`}>
                                ({image.processedSize < image.originalSize ? '-' : '+'}
                                {Math.round(Math.abs(image.processedSize - image.originalSize) / image.originalSize * 100)}%)
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Processing Time:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{image.processingTime}ms</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Format:</span>
                            <span className="ml-2 text-gray-900 dark:text-white uppercase">{image.targetFormat}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}