'use client';

import { ProcessingOptions } from '@/types';

interface ProcessingControlsProps {
  options: ProcessingOptions;
  onOptionsChange: (options: ProcessingOptions) => void;
  disabled?: boolean;
}

export default function ProcessingControls({ 
  options, 
  onOptionsChange, 
  disabled = false 
}: ProcessingControlsProps) {
  const updateOption = (key: keyof ProcessingOptions, value: string | number | boolean | undefined) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="space-y-5">
      {/* Upscaling - Default to no upscaling */}
      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upscale Factor (Warning: High memory usage)
        </label>
        <select
          value={options.upscaleFactor || 1}
          onChange={(e) => updateOption('upscaleFactor', parseInt(e.target.value))}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={1}>No upscaling (1x) - Recommended</option>
          <option value={2}>2x upscaling (High memory usage)</option>
          <option value={4}>4x upscaling (Very high memory usage)</option>
        </select>
        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
          Default is set to no upscaling to prevent memory issues. Only enable upscaling for single images.
        </p>
        {options.upscaleFactor && options.upscaleFactor > 1 && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            Warning: Upscaling uses significant memory. Process only 1-2 images at a time.
          </p>
        )}
      </div>

      {/* Format Conversion */}
      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Output Format
        </label>
        <select
          value={options.targetFormat || 'jpeg'}
          onChange={(e) => updateOption('targetFormat', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
          <option value="avif">AVIF</option>
        </select>
      </div>

      {/* Quality */}
      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Quality: {Math.round((options.quality || 0.9) * 100)}%
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={options.quality || 0.9}
          onChange={(e) => updateOption('quality', parseFloat(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Resizing */}
      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Resize Image
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Width (px)
            </label>
            <input
              type="number"
              value={options.width || ''}
              onChange={(e) => updateOption('width', e.target.value ? parseInt(e.target.value) : undefined)}
              disabled={disabled}
              placeholder="Auto"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Height (px)
            </label>
            <input
              type="number"
              value={options.height || ''}
              onChange={(e) => updateOption('height', e.target.value ? parseInt(e.target.value) : undefined)}
              disabled={disabled}
              placeholder="Auto"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Aspect Ratio */}
        <div className="flex items-center mt-3">
          <input
            type="checkbox"
            id="maintainAspectRatio"
            checked={options.maintainAspectRatio || false}
            onChange={(e) => updateOption('maintainAspectRatio', e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="maintainAspectRatio" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Maintain aspect ratio
          </label>
        </div>
      </div>

      {/* Compression */}
      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Compression Level: {Math.round((options.compressionLevel || 0.8) * 100)}%
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={options.compressionLevel || 0.8}
          onChange={(e) => updateOption('compressionLevel', parseFloat(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Watermark */}
      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Watermark Text (optional)
        </label>
        <input
          type="text"
          value={options.watermarkText || ''}
          onChange={(e) => updateOption('watermarkText', e.target.value)}
          disabled={disabled}
          placeholder="Enter watermark text..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {options.watermarkText && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Watermark Position
            </label>
            <select
              value={options.watermarkPosition || 'bottom-right'}
              onChange={(e) => updateOption('watermarkPosition', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="center">Center</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}