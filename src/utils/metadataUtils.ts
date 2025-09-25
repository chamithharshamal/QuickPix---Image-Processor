import exifr from 'exifr';
import { SimplifiedExifData } from '@/types';

export interface ExifData {
  [key: string]: any;
}

/**
 * Extract EXIF data from an image file
 * @param file - The image file to extract EXIF data from
 * @returns Promise resolving to EXIF data or null if none found
 */
export async function extractExifData(file: File): Promise<SimplifiedExifData | null> {
  try {
    // exifr can work directly with File objects
    const exifData = await exifr.parse(file);
    
    if (!exifData) {
      return null;
    }
    
    // Simplify and organize the data for display
    const simplifiedData: SimplifiedExifData = {};
    
    // Camera information
    if (exifData.Make || exifData.Model) {
      simplifiedData.make = exifData.Make;
      simplifiedData.model = exifData.Model;
      simplifiedData.camera = `${exifData.Make || ''} ${exifData.Model || ''}`.trim();
    }
    
    // Lens information
    if (exifData.LensModel) {
      simplifiedData.lens = exifData.LensModel;
    }
    
    // Exposure information
    if (exifData.FocalLength) {
      simplifiedData.focalLength = `${exifData.FocalLength}mm`;
    }
    
    if (exifData.FNumber) {
      simplifiedData.aperture = `f/${exifData.FNumber}`;
    }
    
    if (exifData.ExposureTime) {
      simplifiedData.shutterSpeed = formatShutterSpeed(exifData.ExposureTime);
    }
    
    if (exifData.ISO) {
      simplifiedData.iso = exifData.ISO.toString();
    }
    
    // Date and time
    if (exifData.DateTimeOriginal) {
      simplifiedData.dateTime = formatDateTime(exifData.DateTimeOriginal);
    } else if (exifData.DateTime) {
      simplifiedData.dateTime = formatDateTime(exifData.DateTime);
    }
    
    // GPS coordinates
    if (exifData.latitude && exifData.longitude) {
      simplifiedData.gps = {
        latitude: exifData.latitude,
        longitude: exifData.longitude
      };
    }
    
    // Software information
    if (exifData.Software) {
      simplifiedData.software = exifData.Software;
    }
    
    return simplifiedData;
  } catch (error) {
    console.error('Error extracting EXIF data:', error);
    return null;
  }
}

/**
 * Remove EXIF data from an image by re-encoding it
 * @param file - The image file to clean
 * @returns Promise resolving to a new File with EXIF data removed
 */
export async function removeExifData(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Create a canvas and draw the image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        // Convert to blob without EXIF data
        canvas.toBlob((blob) => {
          if (blob) {
            const cleanedFile = new File([blob], file.name, {
              type: file.type
            });
            resolve(cleanedFile);
          } else {
            reject(new Error('Failed to create cleaned image'));
          }
        }, file.type);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Load the image
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Format shutter speed as a fraction (e.g., 1/125)
 * @param value - The shutter speed value
 * @returns Formatted shutter speed string
 */
function formatShutterSpeed(value: number): string {
  if (value >= 1) {
    return `${value.toFixed(1)}s`;
  } else {
    const fraction = Math.round(1 / value);
    return `1/${fraction}`;
  }
}

/**
 * Format date time for display
 * @param dateTime - The date time value
 * @returns Formatted date time string
 */
function formatDateTime(dateTime: string | number | Date): string {
  if (typeof dateTime === 'string') {
    return dateTime.replace(/:/, '-').replace(/:/, '-').replace(' ', ' ');
  } else if (typeof dateTime === 'number') {
    return new Date(dateTime * 1000).toLocaleString();
  } else {
    return dateTime.toLocaleString();
  }
}