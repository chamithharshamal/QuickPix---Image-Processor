import * as tf from '@tensorflow/tfjs';
import { memoryManager } from './memoryManager';

// Initialize TensorFlow.js
let isInitialized = false;

async function initializeTensorFlow() {
  if (isInitialized) return;
  
  try {
    // Set memory growth limits
    tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
    tf.env().set('WEBGL_FORCE_F16_TEXTURES', true);
    tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
    tf.env().set('WEBGL_FORCE_F16_TEXTURES', true);
    tf.env().set('WEBGL_PACK', false);
    tf.env().set('WEBGL_LAZILY_UNPACK', true);
    
    // Use CPU backend for better memory management
    await tf.setBackend('cpu');
    await tf.ready();
    isInitialized = true;
    console.log('TensorFlow.js initialized with backend:', tf.getBackend());
  } catch (error) {
    console.warn('Failed to initialize TensorFlow.js, falling back to CPU:', error);
    await tf.setBackend('cpu');
    await tf.ready();
    isInitialized = true;
  }
}

// Simple bicubic upscaling using TensorFlow.js
export async function upscaleImage(
  canvas: HTMLCanvasElement,
  scaleFactor: number
): Promise<HTMLCanvasElement> {
  await initializeTensorFlow();
  
  const originalWidth = canvas.width;
  const originalHeight = canvas.height;
  const newWidth = originalWidth * scaleFactor;
  const newHeight = originalHeight * scaleFactor;
  
  // Get image data
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  const imageData = ctx.getImageData(0, 0, originalWidth, originalHeight);
  const data = imageData.data;
  
  let tensor;
  let upscaled;
  
  try {
    // Start a new scope for memory management
    tf.engine().startScope();
    
    // Convert to tensor (normalize to 0-1)
    tensor = tf.tensor4d(
      Array.from(data).map(val => val / 255),
      [1, originalHeight, originalWidth, 4]
    );
    
    // Use resizeBilinear for upscaling
    upscaled = tf.image.resizeBilinear(tensor, [newHeight, newWidth]);
    
    // Convert back to image data
    const upscaledData = await upscaled.data();
    const newImageData = new ImageData(newWidth, newHeight);
    
    for (let i = 0; i < upscaledData.length; i++) {
      newImageData.data[i] = Math.round(upscaledData[i] * 255);
    }
    
    // Create new canvas
    const newCanvas = document.createElement('canvas');
    const newCtx = newCanvas.getContext('2d');
    if (!newCtx) throw new Error('Could not get canvas context');
    
    newCanvas.width = newWidth;
    newCanvas.height = newHeight;
    newCtx.putImageData(newImageData, 0, 0);
    
    return newCanvas;
  } finally {
    // Aggressive cleanup
    try {
      if (tensor) tensor.dispose();
      if (upscaled) upscaled.dispose();
      
      // End scope to clean up all intermediate tensors
      tf.engine().endScope();
      
      // Clean up TensorFlow memory
      tf.disposeVariables();
      
      // Force garbage collection if available
      if (typeof window !== 'undefined' && window.gc) {
        window.gc();
      }
      
      // Log memory usage
      logMemoryUsage();
    } catch (cleanupError) {
      console.warn('Error during tensor cleanup:', cleanupError);
    }
  }
}

function logMemoryUsage() {
  try {
    const mem = tf.memory();
    console.log(`TensorFlow.js memory: ${JSON.stringify(mem)}`);
  } catch (error) {
    // Ignore memory logging errors
  }
}

// Alternative upscaling method using canvas scaling (faster but lower quality)
export async function upscaleImageCanvas(
  canvas: HTMLCanvasElement,
  scaleFactor: number
): Promise<HTMLCanvasElement> {
  const originalWidth = canvas.width;
  const originalHeight = canvas.height;
  const newWidth = originalWidth * scaleFactor;
  const newHeight = originalHeight * scaleFactor;
  
  const newCanvas = document.createElement('canvas');
  const ctx = newCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  newCanvas.width = newWidth;
  newCanvas.height = newHeight;
  
  // Use high-quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
  
  return newCanvas;
}

// Enhanced upscaling with multiple passes for better quality
export async function upscaleImageEnhanced(
  canvas: HTMLCanvasElement,
  scaleFactor: number
): Promise<HTMLCanvasElement> {
  // If scale factor is 2 or less, use canvas scaling (no TensorFlow.js)
  if (scaleFactor <= 2) {
    return upscaleImageCanvas(canvas, scaleFactor);
  }
  
  // For larger scale factors, do multiple passes
  let currentCanvas = canvas;
  let remainingScale = scaleFactor;
  
  while (remainingScale > 1) {
    const currentScale = Math.min(2, remainingScale);
    currentCanvas = await upscaleImageCanvas(currentCanvas, currentScale);
    remainingScale /= currentScale;
  }
  
  return currentCanvas;
}