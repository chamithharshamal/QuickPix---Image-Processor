'use client';

import React, { useState, useCallback } from 'react';
import { extractExifData, removeExifData } from '@/utils/metadataUtils';
import { SimplifiedExifData } from '@/types';

interface MetadataViewerProps {
  file: File | null;
  onCleanedFile?: (file: File) => void;
}

const MetadataViewer: React.FC<MetadataViewerProps> = ({ file, onCleanedFile }) => {
  const [exifData, setExifData] = useState<SimplifiedExifData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);

  const extractMetadata = useCallback(async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await extractExifData(file);
      setExifData(data);
    } catch (err) {
      setError('Failed to extract metadata');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [file]);

  const handleCleanMetadata = useCallback(async () => {
    if (!file) return;
    
    setCleaning(true);
    setError(null);
    
    try {
      const cleanedFile = await removeExifData(file);
      if (onCleanedFile) {
        onCleanedFile(cleanedFile);
      }
    } catch (err) {
      setError('Failed to clean metadata');
      console.error(err);
    } finally {
      setCleaning(false);
    }
  }, [file, onCleanedFile]);

  React.useEffect(() => {
    if (file) {
      extractMetadata();
    } else {
      setExifData(null);
    }
  }, [file, extractMetadata]);

  if (!file) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Image Metadata
          </h3>
          <button
            onClick={extractMetadata}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <div className="flex items-center gap-1">
                <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            ) : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {exifData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exifData.camera && (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Camera</div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{exifData.camera}</div>
                </div>
              )}
              
              {exifData.lens && (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lens</div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{exifData.lens}</div>
                </div>
              )}
              
              {exifData.focalLength && (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Focal Length</div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{exifData.focalLength}</div>
                </div>
              )}
              
              {exifData.aperture && (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Aperture</div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{exifData.aperture}</div>
                </div>
              )}
              
              {exifData.shutterSpeed && (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Shutter Speed</div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{exifData.shutterSpeed}</div>
                </div>
              )}
              
              {exifData.iso && (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ISO</div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{exifData.iso}</div>
                </div>
              )}
              
              {exifData.dateTime && (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date & Time</div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{exifData.dateTime}</div>
                </div>
              )}
              
              {exifData.software && (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Software</div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{exifData.software}</div>
                </div>
              )}
            </div>

            {exifData.gps && (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location</div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {exifData.gps.latitude.toFixed(6)}, {exifData.gps.longitude.toFixed(6)}
                  </div>
                  <a 
                    href={`https://www.google.com/maps?q=${exifData.gps.latitude},${exifData.gps.longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm inline-block mt-1"
                  >
                    View on Google Maps
                  </a>
                </div>
              )}

            <div className="pt-2">
              <button
                onClick={handleCleanMetadata}
                disabled={cleaning}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all shadow hover:shadow-md"
              >
                {cleaning ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cleaning...
                  </div>
                ) : 'Remove Metadata'}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This will remove all metadata from the image for privacy protection
              </p>
            </div>
          </div>
        ) : !loading ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-8">
            <div className="mx-auto w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">No metadata found</p>
            <p className="text-sm">This image doesn't contain metadata</p>
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-center py-8">
            <div className="flex justify-center mb-3">
              <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p>Loading metadata...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetadataViewer;