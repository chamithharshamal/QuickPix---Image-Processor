import { ProcessedImage, ProcessingOptions, ProcessingProgress } from '@/types';
import { getWorkerManager } from './workerManager';
import { createBatchProcessor } from './batchProcessor';
import * as tf from '@tensorflow/tfjs';
import { memoryManager } from './memoryManager';

export async function processImages(
  files: File[],
  options: ProcessingOptions,
  onProgress: (progress: ProcessingProgress) => void
): Promise<ProcessedImage[]> {
  // Initialize TensorFlow.js on main thread with memory limits
  try {
    // Set memory growth limits
    tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
    tf.env().set('WEBGL_FORCE_F16_TEXTURES', true);
    tf.env().set('WEBGL_PACK', false);
    tf.env().set('WEBGL_LAZILY_UNPACK', true);
    
    // Use CPU backend for better memory management
    await tf.setBackend('cpu');
    await tf.ready();
    console.log('TensorFlow.js initialized with backend:', tf.getBackend());
    
    // Start a new scope for memory management
    tf.engine().startScope();
  } catch (error) {
    console.warn('Failed to initialize TensorFlow.js:', error);
    // Continue without TensorFlow.js if initialization fails
  }
  
  try {
    // Use batch processor for optimal performance
    const batchProcessor = createBatchProcessor(files.length);
    
    // Initialize workers
    const workerManager = getWorkerManager();
    await workerManager.initializeTensorFlow();
    
    // Process using batch processor
    return await batchProcessor.processBatch(files, options, onProgress);
  } finally {
    // Clean up TensorFlow memory
    try {
      if (tf.engine) {
        tf.engine().endScope();
      }
      tf.disposeVariables();
      
      // Force garbage collection if available
      if (typeof window !== 'undefined' && window.gc) {
        window.gc();
      }
    } catch (error) {
      console.warn('Error during TensorFlow cleanup:', error);
    }
  }
}