/**
 * Utility functions for image processing operations that can be performed
 * either on the main thread or in web workers.
 */

/**
 * Convert canvas to blob with specified format and quality
 */
export async function convertFormat(
  canvas: HTMLCanvasElement,
  format: 'jpeg' | 'png' | 'webp' | 'avif' = 'jpeg',
  quality: number = 0.9
): Promise<Blob> {
  const mimeType = `image/${format}`;
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(`Failed to convert canvas to ${format}`));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Resize image while maintaining aspect ratio if specified
 */
export async function resizeImage(
  canvas: HTMLCanvasElement,
  options: { width?: number; height?: number; maintainAspectRatio?: boolean }
): Promise<HTMLCanvasElement> {
  const { width, height, maintainAspectRatio = true } = options;
  
  if (!width && !height) {
    return canvas; // No resizing needed
  }

  const originalWidth = canvas.width;
  const originalHeight = canvas.height;
  
  let newWidth = width || originalWidth;
  let newHeight = height || originalHeight;

  // Maintain aspect ratio if requested
  if (maintainAspectRatio && (width || height)) {
    const aspectRatio = originalWidth / originalHeight;
    
    if (width && !height) {
      newHeight = Math.round(width / aspectRatio);
    } else if (height && !width) {
      newWidth = Math.round(height * aspectRatio);
    } else if (width && height) {
      // When both are specified, fit within the bounds while maintaining aspect ratio
      const targetRatio = width / height;
      if (targetRatio > aspectRatio) {
        newWidth = Math.round(height * aspectRatio);
      } else {
        newHeight = Math.round(width / aspectRatio);
      }
    }
  }

  // Create new canvas with resized dimensions
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

/**
 * Compress image by reducing quality
 */
export async function compressImage(
  canvas: HTMLCanvasElement,
  compressionLevel: number // 0-1, where 1 is no compression and 0 is maximum compression
): Promise<HTMLCanvasElement> {
  // Compression is achieved by reducing quality when converting to JPEG
  // compressionLevel maps to quality (0.1-1.0)
  const quality = Math.max(0.1, Math.min(1.0, compressionLevel));
  
  // Convert to JPEG with reduced quality and then back to canvas
  const blob = await convertFormat(canvas, 'jpeg', quality);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const newCanvas = document.createElement('canvas');
      const ctx = newCanvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      newCanvas.width = img.width;
      newCanvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Clean up
      URL.revokeObjectURL(img.src);
      resolve(newCanvas);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Add watermark to image
 */
export async function addWatermark(
  canvas: HTMLCanvasElement,
  options: { text: string; position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' }
): Promise<HTMLCanvasElement> {
  const { text, position } = options;
  
  const newCanvas = document.createElement('canvas');
  const ctx = newCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;
  
  // Copy original image
  ctx.drawImage(canvas, 0, 0);
  
  // Configure watermark style
  ctx.font = `${Math.max(12, Math.min(48, Math.min(canvas.width, canvas.height) / 20))}px Arial`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 2;
  
  // Calculate text position
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = parseInt(ctx.font, 10);
  
  let x = 0;
  let y = 0;
  
  switch (position) {
    case 'top-left':
      x = 20;
      y = 20 + textHeight;
      break;
    case 'top-right':
      x = canvas.width - textWidth - 20;
      y = 20 + textHeight;
      break;
    case 'bottom-left':
      x = 20;
      y = canvas.height - 20;
      break;
    case 'bottom-right':
      x = canvas.width - textWidth - 20;
      y = canvas.height - 20;
      break;
    case 'center':
      x = (canvas.width - textWidth) / 2;
      y = (canvas.height + textHeight) / 2;
      break;
  }
  
  // Draw watermark
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
  
  return newCanvas;
}