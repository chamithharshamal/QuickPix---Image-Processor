/**
 * Memory Management Utility for Image Processing
 * Helps prevent memory leaks and high memory usage in browser-based image processing
 */

export class MemoryManager {
  private static instance: MemoryManager;
  private cleanupCallbacks: Array<() => void> = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startMemoryMonitoring();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Register a cleanup callback to be called when memory needs to be freed
   */
  registerCleanup(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  /**
   * Unregister a cleanup callback
   */
  unregisterCleanup(callback: () => void): void {
    const index = this.cleanupCallbacks.indexOf(callback);
    if (index > -1) {
      this.cleanupCallbacks.splice(index, 1);
    }
  }

  /**
   * Force cleanup of all registered resources
   */
  forceCleanup(): void {
    console.log('MemoryManager: Forcing cleanup of registered resources');
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Error during cleanup callback:', error);
      }
    });
    
    // Clear the callbacks array
    this.cleanupCallbacks = [];
    
    // Force garbage collection if available
    this.forceGarbageCollection();
  }

  /**
   * Check if memory pressure is high
   */
  isMemoryPressureHigh(): boolean {
    try {
      if (typeof window !== 'undefined' && (window.performance as any).memory) {
        const memory = (window.performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1048576;
        const totalMB = memory.jsHeapSizeLimit / 1048576;
        const pressure = usedMB / totalMB;
        
        return pressure > 0.6; // 60% threshold
      }
    } catch (error) {
      // Ignore memory checking errors
    }
    return false;
  }

  /**
   * Get current memory usage information
   */
  getMemoryInfo(): { usedMB?: number; totalMB?: number; pressure?: number } {
    try {
      if (typeof window !== 'undefined' && (window.performance as any).memory) {
        const memory = (window.performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1048576;
        const totalMB = memory.jsHeapSizeLimit / 1048576;
        const pressure = usedMB / totalMB;
        
        return { usedMB, totalMB, pressure };
      }
    } catch (error) {
      // Ignore memory checking errors
    }
    return {};
  }

  /**
   * Force garbage collection if available
   */
  forceGarbageCollection(): void {
    try {
      if (typeof window !== 'undefined' && window.gc) {
        console.log('MemoryManager: Forcing garbage collection');
        window.gc();
      }
    } catch (error) {
      console.warn('MemoryManager: Failed to force garbage collection:', error);
    }
  }

  /**
   * Start monitoring memory usage
   */
  private startMemoryMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      if (this.isMemoryPressureHigh()) {
        console.warn('MemoryManager: High memory pressure detected, triggering cleanup');
        this.forceCleanup();
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Stop monitoring memory usage
   */
  stopMemoryMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Clean up resources when the manager is destroyed
   */
  destroy(): void {
    this.stopMemoryMonitoring();
    this.forceCleanup();
  }
}

// Export a singleton instance
export const memoryManager = MemoryManager.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    memoryManager.destroy();
  });
}

export default memoryManager;