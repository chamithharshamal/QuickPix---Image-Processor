import * as tf from '@tensorflow/tfjs';

// Simple bicubic upscaling using canvas scaling (faster and lower memory usage)
export async function upscaleImage(
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