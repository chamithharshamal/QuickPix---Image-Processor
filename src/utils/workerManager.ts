import { ProcessingOptions } from '@/types';
import { upscaleImage } from './upscaler';
import { convertFormat, resizeImage, compressImage, addWatermark } from './imageUtils';
import { memoryManager } from './memoryManager';

export class WorkerManager {
  private workers: Worker[] = [];
  private maxWorkers: number;
  private currentWorkerIndex = 0;

  constructor(maxWorkers: number = navigator.hardwareConcurrency || 4) {
    this.maxWorkers = Math.min(maxWorkers, 4); // Cap at 4 workers (reduced from 8)
    this.initializeWorkers();
    
    // Clean up TensorFlow memory periodically
    this.setupMemoryCleanup();
  }

  private initializeWorkers() {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker('/imageWorker.js');
      this.workers.push(worker);
    }
  }

  private setupMemoryCleanup() {
    // Periodically clean up TensorFlow memory
    setInterval(() => {
      try {
        // @ts-ignore - TensorFlow.js internal API
        if (typeof tf !== 'undefined' && tf.engine) {
          // @ts-ignore - TensorFlow.js internal API
          tf.engine().endScope();
          // @ts-ignore - TensorFlow.js internal API
          tf.engine().startScope();
        }
        
        // Force garbage collection if available
        if (typeof window !== 'undefined' && window.gc) {
          window.gc();
        }
      } catch (error) {
        console.warn('Failed to clean up TensorFlow memory:', error);
      }
    }, 15000); // Every 15 seconds (more frequent)
    
    // Register cleanup callback with memory manager
    memoryManager.registerCleanup(() => {
      this.terminate();
    });
  }

  async processImageWithWorker(
    file: File,
    options: ProcessingOptions
  ): Promise<{ blob: Blob; processingTime: number }> {
    const startTime = Date.now();

    // Load image
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    let processedCanvas = canvas;

    // Upscaling (done on main thread with TensorFlow.js)
    if (options.upscaleFactor && options.upscaleFactor > 1) {
      processedCanvas = await upscaleImage(processedCanvas, options.upscaleFactor);
    }

    // Watermarking (done on main thread)
    if (options.watermarkText) {
      processedCanvas = await addWatermark(processedCanvas, {
        text: options.watermarkText,
        position: options.watermarkPosition || 'bottom-right'
      });
    }

    // Compression (done on main thread)
    if (options.compressionLevel && options.compressionLevel < 1) {
      processedCanvas = await compressImage(processedCanvas, options.compressionLevel);
    }

    // For resizing and format conversion, use worker if no upscaling/watermarking
    if (!options.upscaleFactor && !options.watermarkText && !options.compressionLevel) {
      return this.processWithWorker(processedCanvas, options, startTime);
    }

    // Otherwise, do everything on main thread
    const finalCanvas = await this.processOnMainThread(processedCanvas, options);
    const blob = await convertFormat(finalCanvas, options.targetFormat || 'jpeg', options.quality || 0.9);
    
    return { blob, processingTime: Date.now() - startTime };
  }

  private async processWithWorker(
    canvas: HTMLCanvasElement,
    options: ProcessingOptions,
    startTime: number
  ): Promise<{ blob: Blob; processingTime: number }> {
    const worker = this.getNextWorker();

    return new Promise((resolve, reject) => {
      const handleMessage = (e: MessageEvent) => {
        const { type, data } = e.data;
        
        switch (type) {
          case 'PROCESS_COMPLETE':
            worker.removeEventListener('message', handleMessage);
            const blob = new Blob([data.arrayBuffer], { 
              type: `image/${options.targetFormat || 'jpeg'}` 
            });
            const processingTime = Date.now() - startTime;
            resolve({ blob, processingTime });
            break;
            
          case 'ERROR':
            worker.removeEventListener('message', handleMessage);
            reject(new Error(data.message));
            break;
        }
      };

      worker.addEventListener('message', handleMessage);

      // Convert canvas to image data
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      worker.postMessage({
        type: 'PROCESS_IMAGE',
        data: {
          imageData: {
            data: Array.from(imageData.data),
            width: imageData.width,
            height: imageData.height
          },
          options
        }
      });
    });
  }

  private async processOnMainThread(
    canvas: HTMLCanvasElement,
    options: ProcessingOptions
  ): Promise<HTMLCanvasElement> {
    let processedCanvas = canvas;

    // Resizing
    if (options.width || options.height) {
      processedCanvas = await resizeImage(processedCanvas, {
        width: options.width,
        height: options.height,
        maintainAspectRatio: options.maintainAspectRatio
      });
    }

    return processedCanvas;
  }

  private getNextWorker(): Worker {
    const worker = this.workers[this.currentWorkerIndex];
    this.currentWorkerIndex = (this.currentWorkerIndex + 1) % this.workers.length;
    return worker;
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  async initializeTensorFlow(): Promise<void> {
    // TensorFlow.js is initialized on main thread, no need to initialize in workers
    return Promise.resolve();
  }

  terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    
    // Clean up TensorFlow memory
    try {
      // @ts-ignore - TensorFlow.js internal API
      if (typeof tf !== 'undefined' && tf.engine) {
        // @ts-ignore - TensorFlow.js internal API
        tf.engine().endScope();
      }
    } catch (error) {
      console.warn('Failed to clean up TensorFlow memory on termination:', error);
    }
  }
}

// Singleton instance
let workerManager: WorkerManager | null = null;

export function getWorkerManager(): WorkerManager {
  if (!workerManager) {
    workerManager = new WorkerManager();
  }
  return workerManager;
}

export function terminateWorkerManager() {
  if (workerManager) {
    workerManager.terminate();
    workerManager = null;
  }
}
