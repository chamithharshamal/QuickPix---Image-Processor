'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import MetadataViewer from '@/components/MetadataViewer';

export default function MetadataSection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cleanedFile, setCleanedFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      
      // Clean up the URL when the component unmounts or file changes
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      // Filter for image files only
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setCleanedFile(null);
        setDownloadUrl(null);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp', '.avif', '.tiff']
    },
    multiple: false,
    maxFiles: 1
  });

  const handleCleanedFile = (file: File) => {
    setCleanedFile(file);
    setDownloadUrl(URL.createObjectURL(file));
  };

  const handleDownload = () => {
    if (!downloadUrl || !cleanedFile) return;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `cleaned_${selectedFile?.name || 'image.jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Upload Section */}
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Image
          </h2>
          
          <div 
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-gray-800'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {isDragActive ? 'Drop an image here' : 'Drag & drop an image'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  or click to select a file
                </p>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/30 rounded-lg py-2 px-4 inline-block">
                <p>Supports: JPEG, PNG, GIF, BMP, WebP, AVIF, TIFF</p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Preview Section */}
        {previewUrl && (
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Image Preview
            </h3>
            <div className="border rounded-xl p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-64 object-contain rounded-lg"
                />
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {selectedFile?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedFile ? (selectedFile.size / 1024).toFixed(1) : '0'} KB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Metadata Viewer */}
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Metadata Information
          </h2>
          
          {selectedFile ? (
            <div className="space-y-6">
              <MetadataViewer 
                file={selectedFile} 
                onCleanedFile={handleCleanedFile} 
              />
              
              {cleanedFile && downloadUrl && (
                <div className="border rounded-xl p-4 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-medium mb-2 text-green-800 dark:text-green-200">Metadata Removed Successfully!</h3>
                  <p className="text-green-700 dark:text-green-300 mb-4 text-sm">
                    Your image has been cleaned of all metadata. You can now download the privacy-protected version.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm shadow hover:shadow-md transition-all"
                  >
                    Download Cleaned Image
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-xl p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 h-51 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">No image selected</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload an image to view its metadata
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}