export interface PerformanceMetrics {
  totalImages: number;
  processedImages: number;
  failedImages: number;
  totalProcessingTime: number;
  averageProcessingTime: number;
  memoryUsage: number;
  errors: string[];
}

export class PerformanceMonitor {
  private startTime: number = 0;
  private metrics: PerformanceMetrics = {
    totalImages: 0,
    processedImages: 0,
    failedImages: 0,
    totalProcessingTime: 0,
    averageProcessingTime: 0,
    memoryUsage: 0,
    errors: []
  };

  start(totalImages: number) {
    this.startTime = Date.now();
    this.metrics = {
      totalImages,
      processedImages: 0,
      failedImages: 0,
      totalProcessingTime: 0,
      averageProcessingTime: 0,
      memoryUsage: 0,
      errors: []
    };
  }

  recordSuccess(processingTime: number) {
    this.metrics.processedImages++;
    this.metrics.totalProcessingTime += processingTime;
    this.metrics.averageProcessingTime = this.metrics.totalProcessingTime / this.metrics.processedImages;
    this.updateMemoryUsage();
  }

  recordError(error: string) {
    this.metrics.failedImages++;
    this.metrics.errors.push(error);
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getSummary(): string {
    const successRate = (this.metrics.processedImages / this.metrics.totalImages) * 100;
    const totalTime = Date.now() - this.startTime;
    
    return `
Processing Summary:
- Total Images: ${this.metrics.totalImages}
- Successfully Processed: ${this.metrics.processedImages} (${successRate.toFixed(1)}%)
- Failed: ${this.metrics.failedImages}
- Total Time: ${(totalTime / 1000).toFixed(2)}s
- Average Processing Time: ${this.metrics.averageProcessingTime.toFixed(0)}ms per image
- Memory Usage: ${(this.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB
    `.trim();
  }

  private updateMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as { memory?: { usedJSHeapSize: number } }).memory;
      if (memory) {
        this.metrics.memoryUsage = memory.usedJSHeapSize;
      }
    }
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

export function resetPerformanceMonitor() {
  performanceMonitor = null;
}
