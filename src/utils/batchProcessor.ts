import { ProcessedImage, ProcessingOptions, ProcessingProgress } from '@/types';
import { getWorkerManager } from './workerManager';
import { getPerformanceMonitor } from './performanceMonitor';

export interface BatchConfig {
  maxConcurrentBatches: number;
  batchSize: number;
  enableProgressUpdates: boolean;
  enablePerformanceMonitoring: boolean;
}

export class BatchProcessor {
  private config: BatchConfig;
  private performanceMonitor = getPerformanceMonitor();

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = {
      maxConcurrentBatches: 2,
      batchSize: 5,
      enableProgressUpdates: true,
      enablePerformanceMonitoring: true,
      ...config
    };
  }

  async processBatch(
    files: File[],
    options: ProcessingOptions,
    onProgress: (progress: ProcessingProgress) => void
  ): Promise<ProcessedImage[]> {
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
    }

    if (this.config.enablePerformanceMonitoring) {
      console.log(this.performanceMonitor.getSummary());
    }

    return results;
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

        const result: ProcessedImage = {
          id: `${file.name}-${Date.now()}-${globalIndex}`,
          originalFile: file,
          processedBlob: blob,
          processedUrl: URL.createObjectURL(blob),
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
}

// Factory function for creating optimized batch processors
export function createBatchProcessor(fileCount: number): BatchProcessor {
  let config: Partial<BatchConfig> = {};

  if (fileCount <= 10) {
    // Small batches - process all at once
    config = {
      maxConcurrentBatches: 1,
      batchSize: fileCount,
      enableProgressUpdates: true,
      enablePerformanceMonitoring: false
    };
  } else if (fileCount <= 50) {
    // Medium batches - moderate concurrency
    config = {
      maxConcurrentBatches: 2,
      batchSize: 5,
      enableProgressUpdates: true,
      enablePerformanceMonitoring: true
    };
  } else {
    // Large batches - controlled concurrency
    config = {
      maxConcurrentBatches: 2,
      batchSize: 3,
      enableProgressUpdates: true,
      enablePerformanceMonitoring: true
    };
  }

  return new BatchProcessor(config);
}
