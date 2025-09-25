import * as tf from '@tensorflow/tfjs';

// Initialize TensorFlow.js
let isInitialized = false;

async function initializeTensorFlow() {
  if (isInitialized) return;
  
  try {
    // Set backend to WebGL for better performance
    await tf.setBackend('webgl');
    await tf.ready();
    isInitialized = true;
    console.log('TensorFlow.js initialized with backend:', tf.getBackend());
  } catch (error) {
    console.warn('WebGL not available, falling back to CPU:', error);
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
  
  // Convert to tensor (normalize to 0-1)
  const tensor = tf.tensor4d(
    Array.from(data).map(val => val / 255),
    [1, originalHeight, originalWidth, 4]
  );
  
  // Use resizeBilinear for upscaling
  const upscaled = tf.image.resizeBilinear(tensor, [newHeight, newWidth]);
  
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
  
  // Clean up tensors
  tensor.dispose();
  upscaled.dispose();
  
  return newCanvas;
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
  // If scale factor is 2 or less, use TensorFlow.js
  if (scaleFactor <= 2) {
    return upscaleImage(canvas, scaleFactor);
  }
  
  // For larger scale factors, do multiple passes
  let currentCanvas = canvas;
  let remainingScale = scaleFactor;
  
  while (remainingScale > 1) {
    const currentScale = Math.min(2, remainingScale);
    currentCanvas = await upscaleImage(currentCanvas, currentScale);
    remainingScale /= currentScale;
  }
  
  return currentCanvas;
}


