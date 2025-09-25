// Web Worker for image processing (without TensorFlow.js)
self.onmessage = async function(e) {
  const { type, data } = e.data;
  
  try {
    switch (type) {
      case 'PROCESS_IMAGE':
        const result = await processImageInWorker(data);
        self.postMessage({
          type: 'PROCESS_COMPLETE',
          data: result
        });
        break;
        
      default:
        self.postMessage({
          type: 'ERROR',
          data: { message: 'Unknown message type' }
        });
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      data: { message: error.message, stack: error.stack }
    });
  }
};

async function processImageInWorker(data) {
  const { imageData, options } = data;
  
  // Create canvas from image data
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext('2d');
  const imgData = new ImageData(imageData.data, imageData.width, imageData.height);
  ctx.putImageData(imgData, 0, 0);
  
  let processedCanvas = canvas;
  
  // Resizing (without upscaling - that will be done on main thread)
  if (options.width || options.height) {
    processedCanvas = await resizeImage(processedCanvas, {
      width: options.width,
      height: options.height,
      maintainAspectRatio: options.maintainAspectRatio
    });
  }
  
  // Convert to blob
  const blob = await processedCanvas.convertToBlob({
    type: `image/${options.targetFormat || 'jpeg'}`,
    quality: options.quality || 0.9
  });
  
  // Convert blob to array buffer for transfer
  const arrayBuffer = await blob.arrayBuffer();
  
  return {
    arrayBuffer,
    width: processedCanvas.width,
    height: processedCanvas.height,
    size: arrayBuffer.byteLength
  };
}

async function resizeImage(canvas, options) {
  const { width, height, maintainAspectRatio = true } = options;
  
  if (!width && !height) {
    return canvas;
  }

  const originalWidth = canvas.width;
  const originalHeight = canvas.height;
  
  let newWidth = width || originalWidth;
  let newHeight = height || originalHeight;
  
  if (maintainAspectRatio) {
    const aspectRatio = originalWidth / originalHeight;
    
    if (width && !height) {
      newHeight = Math.round(width / aspectRatio);
    } else if (height && !width) {
      newWidth = Math.round(height * aspectRatio);
    } else if (width && height) {
      const widthRatio = width / originalWidth;
      const heightRatio = height / originalHeight;
      const ratio = Math.min(widthRatio, heightRatio);
      newWidth = Math.round(originalWidth * ratio);
      newHeight = Math.round(originalHeight * ratio);
    }
  }

  const newCanvas = new OffscreenCanvas(newWidth, newHeight);
  const ctx = newCanvas.getContext('2d');
  
  // Use high-quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
  
  return newCanvas;
}
