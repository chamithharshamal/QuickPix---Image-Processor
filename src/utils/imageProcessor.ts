import { ProcessedImage, ProcessingOptions, ProcessingProgress } from '@/types';
import { getWorkerManager } from './workerManager';
import { createBatchProcessor } from './batchProcessor';

export async function processImages(
  files: File[],
  options: ProcessingOptions,
  onProgress: (progress: ProcessingProgress) => void
): Promise<ProcessedImage[]> {
  // Initialize workers
  const workerManager = getWorkerManager();
  
  // Use batch processor for optimal performance
  const batchProcessor = createBatchProcessor(files.length);
  
  // Process using batch processor
  return await batchProcessor.processBatch(files, options, onProgress);
}