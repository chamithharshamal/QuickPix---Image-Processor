export interface ProcessedImage {
  id: string;
  originalFile: File;
  processedBlob: Blob;
  processedUrl: string;
  originalSize: number;
  processedSize: number;
  processingTime: number;
  operation: string;
  targetFormat: string;
}

export interface ProcessingOptions {
  upscaleFactor?: number;
  targetFormat?: 'jpeg' | 'png' | 'webp' | 'avif';
  quality?: number;
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  compressionLevel?: number;
  watermarkText?: string;
  watermarkPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

export interface ProcessingProgress {
  current: number;
  total: number;
  currentFile: string;
  operation: string;
}

export interface ImageProcessorConfig {
  useWebWorkers: boolean;
  maxConcurrentProcesses: number;
  enableTensorFlow: boolean;
}

export interface ExifData {
  [key: string]: unknown;
}

export interface SimplifiedExifData {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  dateTime?: string;
  gps?: {
    latitude: number;
    longitude: number;
  };
  make?: string;
  model?: string;
  software?: string;
}