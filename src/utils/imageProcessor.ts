import { ProcessedImage, ProcessingOptions, ProcessingProgress } from '@/types';
import { getWorkerManager } from './workerManager';
import { createBatchProcessor } from './batchProcessor';
import * as tf from '@tensorflow/tfjs';

export async function processImages(
  files: File[],
  options: ProcessingOptions,
  onProgress: (progress: ProcessingProgress) => void
): Promise<ProcessedImage[]> {
  // Initialize TensorFlow.js on main thread
  try {
    await tf.setBackend('webgl');
    await tf.ready();
    console.log('TensorFlow.js initialized with backend:', tf.getBackend());
  } catch (error) {
    console.warn('WebGL not available, falling back to CPU:', error);
    await tf.setBackend('cpu');
    await tf.ready();
  }
  
  // Use batch processor for optimal performance
  const batchProcessor = createBatchProcessor(files.length);
  
  // Initialize workers
  const workerManager = getWorkerManager();
  await workerManager.initializeTensorFlow();
  
  // Process using batch processor
  return batchProcessor.processBatch(files, options, onProgress);
}


