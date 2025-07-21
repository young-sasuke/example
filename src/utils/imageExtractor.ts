// src/utils/imageExtractor.ts
import fetch from 'node-fetch';
import { Payload } from 'payload';

export interface ExtractedImageInfo {
  url: string;
  path: string;
  context: Record<string, unknown>;
}

export class ImageExtractor {
  // Common image URL patterns
  private static imageUrlPatterns = [
    /https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg|bmp)/i,
    /https?:\/\/.*\/.*\?.*format=(jpg|jpeg|png|gif|webp)/i,
    // Add patterns for common CDN URLs
    /https?:\/\/.*cloudinary\.com\/.*\/(upload|fetch)\/.*/i,
    /https?:\/\/.*\.supabase\.co\/storage\/.*\/(public|private)\/.*/i,
    /https?:\/\/.*\.imgur\.com\/.*/i,
  ];

  /**
   * Recursively extract image URLs from a JSON object
   */
  static extractImageUrls(data: unknown, currentPath: string = ''): ExtractedImageInfo[] {
    const images: ExtractedImageInfo[] = [];

    if (!data) return images;

    // Handle arrays
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        const path = `${currentPath}[${index}]`;
        images.push(...this.extractImageUrls(item, path));
      });
      return images;
    }

    // Handle objects
    if (typeof data === 'object' && data !== null) {
      Object.entries(data).forEach(([key, value]) => {
        const path = currentPath ? `${currentPath}.${key}` : key;
        
        // Check if the value is a string that matches image URL patterns
        if (typeof value === 'string' && this.isImageUrl(value)) {
          images.push({
            url: value,
            path: path,
            context: this.getContext(data as Record<string, unknown>, key)
          });
        } else {
          // Recurse into nested structures
          images.push(...this.extractImageUrls(value, path));
        }
      });
    }

    return images;
  }

  /**
   * Check if a string is an image URL
   */
  static isImageUrl(str: string): boolean {
    if (!str || typeof str !== 'string') return false;
    
    // Check against patterns
    return this.imageUrlPatterns.some(pattern => pattern.test(str));
  }

  /**
   * Get contextual information around an image
   */
  static getContext(obj: Record<string, unknown>, imageKey: string): Record<string, unknown> {
    const context: Record<string, unknown> = {};
    
    // Look for common metadata fields
    const metadataKeys = ['alt', 'title', 'caption', 'description', 'name'];
    
    metadataKeys.forEach(key => {
      // Check for direct properties
      if (obj[key]) context[key] = obj[key];
      
      // Check for related properties (e.g., image_alt, imageAlt)
      const relatedKey1 = `${imageKey}_${key}`;
      const relatedKey2 = `${imageKey}${key.charAt(0).toUpperCase() + key.slice(1)}`;
      
      if (obj[relatedKey1]) context[key] = obj[relatedKey1];
      if (obj[relatedKey2]) context[key] = obj[relatedKey2];
    });

    return context;
  }

  /**
   * Download an image from URL and prepare it for upload
   */
  static async downloadImage(url: string): Promise<{
    buffer: Buffer;
    mimeType: string;
    filename: string;
  } | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch image: ${url}`);
        return null;
      }

      const buffer = await response.buffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      // Generate filename from URL
      const urlParts = new URL(url).pathname.split('/');
      let filename = urlParts[urlParts.length - 1] || 'image';
      
      // Ensure filename has an extension
      if (!filename.includes('.')) {
        const ext = contentType.split('/')[1] || 'jpg';
        filename = `${filename}.${ext}`;
      }

      return {
        buffer,
        mimeType: contentType,
        filename: filename.replace(/[^a-zA-Z0-9.-]/g, '_')
      };
    } catch (error) {
      console.error(`Error downloading image ${url}:`, error);
      return null;
    }
  }

  /**
   * Check if an image already exists in the collection
   */
  static async imageExists(payload: Payload, sourceUrl: string): Promise<boolean> {
    try {
      const result = await payload.find({
        collection: 'images',
        where: {
          sourceUrl: {
            equals: sourceUrl,
          },
        },
        limit: 1,
      });

      return result.docs.length > 0;
    } catch (error) {
      console.error('Error checking image existence:', error);
      return false;
    }
  }
}