import { ProcessedImage, ProcessingOptions, ProcessingProgress } from '@/types';
import { getWorkerManager } from './workerManager';
import { getPerformanceMonitor } from './performanceMonitor';
import { memoryManager } from './memoryManager';

export interface BatchConfig {
  maxConcurrentBatches: number;
  batchSize: number;
  enableProgressUpdates: boolean;
  enablePerformanceMonitoring: boolean;
}

export class BatchProcessor {
  private config: BatchConfig;
  private performanceMonitor = getPerformanceMonitor();
  private createdUrls: string[] = [];

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = {
      maxConcurrentBatches: 1,
      batchSize: 1,
      enableProgressUpdates: true,
      enablePerformanceMonitoring: true,
      ...config
    };
    
    // Register cleanup callback with memory manager
    memoryManager.registerCleanup(() => {
      this.cleanupUrls();
    });
  }

  async processBatch(
    files: File[],
    options: ProcessingOptions,
    onProgress: (progress: ProcessingProgress) => void
  ): Promise<ProcessedImage[]> {
    // Check memory pressure before starting
    if (this.isMemoryPressureHigh()) {
      console.warn('High memory pressure detected, reducing batch size');
      this.config.batchSize = Math.max(1, Math.floor(this.config.batchSize / 2));
    }

    if (this.config.enablePerformanceMonitoring) {
      this.performanceMonitor.start(files.length);
    }

    const results: ProcessedImage[] = [];
    const batches = this.createBatches(files, this.config.batchSize);
    
    // Process batches with controlled concurrency
    const batchPromises = batches.map((batch, batchIndex) => 
      this.processSingleBatch(batch, batchIndex, options, onProgress)
    );

    // Process batches in chunks to control memory usage
    const chunkSize = this.config.maxConcurrentBatches;
    for (let i = 0; i < batchPromises.length; i += chunkSize) {
      const chunk = batchPromises.slice(i, i + chunkSize);
      const chunkResults = await Promise.allSettled(chunk);
      
      // Collect results from this chunk
      chunkResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(...result.value);
        }
      });
      
      // Force garbage collection between chunks
      if (typeof window !== 'undefined' && window.gc) {
        window.gc();
      }
      
      // Check memory pressure
      if (this.isMemoryPressureHigh()) {
        console.warn('High memory pressure detected during processing, pausing...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Pause for 1 second
      }
    }

    if (this.config.enablePerformanceMonitoring) {
      console.log(this.performanceMonitor.getSummary());
    }

    // Clean up object URLs
    this.cleanupUrls();
    
    // Force memory cleanup
    memoryManager.forceCleanup();

    return results;
  }

  private isMemoryPressureHigh(): boolean {
    return memoryManager.isMemoryPressureHigh();
  }

  private createBatches(files: File[], batchSize: number): File[][] {
    const batches: File[][] = [];
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }
    return batches;
  }

  private async processSingleBatch(
    batch: File[],
    batchIndex: number,
    options: ProcessingOptions,
    onProgress: (progress: ProcessingProgress) => void
  ): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = [];
    const workerManager = getWorkerManager();

    for (let i = 0; i < batch.length; i++) {
      const file = batch[i];
      const globalIndex = batchIndex * this.config.batchSize + i;
      
      if (this.config.enableProgressUpdates) {
        onProgress({
          current: globalIndex + 1,
          total: 0, // Will be updated by parent
          currentFile: file.name,
          operation: `Processing batch ${batchIndex + 1}...`
        });
      }

      try {
        const { blob, processingTime } = await workerManager.processImageWithWorker(
          file,
          options
        );

        const processedUrl = URL.createObjectURL(blob);
        this.createdUrls.push(processedUrl);

        const result: ProcessedImage = {
          id: `${file.name}-${Date.now()}-${globalIndex}`,
          originalFile: file,
          processedBlob: blob,
          processedUrl: processedUrl,
          originalSize: file.size,
          processedSize: blob.size,
          processingTime,
          operation: this.generateOperationDescription(options),
          targetFormat: options.targetFormat || 'jpeg'
        };

        results.push(result);

        if (this.config.enablePerformanceMonitoring) {
          this.performanceMonitor.recordSuccess(processingTime);
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        
        if (this.config.enablePerformanceMonitoring) {
          this.performanceMonitor.recordError(`Failed to process ${file.name}: ${error}`);
        }
      }
    }

    return results;
  }

  private generateOperationDescription(options: ProcessingOptions): string {
    const operations = [];
    
    if (options.upscaleFactor && options.upscaleFactor > 1) {
      operations.push(`${options.upscaleFactor}x upscale`);
    }
    
    if (options.width || options.height) {
      operations.push('resize');
    }
    
    if (options.watermarkText) {
      operations.push('watermark');
    }
    
    if (options.compressionLevel && options.compressionLevel < 1) {
      operations.push('compress');
    }
    
    operations.push(options.targetFormat?.toUpperCase() || 'JPEG');
    
    return operations.join(' + ');
  }

  private cleanupUrls() {
    this.createdUrls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('Failed to revoke object URL:', error);
      }
    });
    this.createdUrls = [];
  }
}

// Factory function for creating optimized batch processors
export function createBatchProcessor(fileCount: number): BatchProcessor {
  let config: Partial<BatchConfig> = {};

  if (fileCount <= 2) {
    // Very small batches - process all at once
    config = {
      maxConcurrentBatches: 1,
      batchSize: 1,
      enableProgressUpdates: true,
      enablePerformanceMonitoring: false
    };
  } else if (fileCount <= 5) {
    // Small batches - reduced concurrency
    config = {
      maxConcurrentBatches: 1,
      batchSize: 1,
      enableProgressUpdates: true,
      enablePerformanceMonitoring: true
    };
  } else {
    // Large batches - controlled concurrency with very small batch sizes
    config = {
      maxConcurrentBatches: 1,
      batchSize: 1,
      enableProgressUpdates: true,
      enablePerformanceMonitoring: true
    };
  }

  return new BatchProcessor(config);
}
