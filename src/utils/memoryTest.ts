/**
 * Memory Test Utility
 * Simple test to verify memory management improvements
 */

import { memoryManager } from './memoryManager';

export async function runMemoryTest(): Promise<void> {
  console.log('Starting memory test...');
  
  // Test memory pressure detection
  const isHighPressure = memoryManager.isMemoryPressureHigh();
  console.log('Memory pressure high:', isHighPressure);
  
  // Test memory info retrieval
  const memoryInfo = memoryManager.getMemoryInfo();
  console.log('Memory info:', memoryInfo);
  
  // Test force cleanup
  memoryManager.forceCleanup();
  console.log('Force cleanup completed');
  
  // Test garbage collection
  memoryManager.forceGarbageCollection();
  console.log('Garbage collection completed');
  
  console.log('Memory test completed');
}

export default runMemoryTest;