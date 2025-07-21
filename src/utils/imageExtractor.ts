// src/utils/imageExtractor.ts
import fetch from 'node-fetch';
import { Payload } from 'payload';

export interface ExtractedImageInfo {
  url: string;
  path: string;
  context: Record<string, unknown>;
}

export class ImageExtractor {
  // Comprehensive image URL patterns
  private static imageUrlPatterns = [
    // Direct image extensions
    /https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i,
    // Supabase storage (your specific case)
    /https?:\/\/.*\.supabase\.co\/storage\/.*\/public\/.*/i,
    /https?:\/\/.*\.supabase\.co\/storage\/.*\/object\/public\/.*/i,
    // Common CDNs
    /https?:\/\/.*cloudinary\.com\/.*\/(upload|fetch)\/.*/i,
    /https?:\/\/.*\.imgur\.com\/.*/i,
    /https?:\/\/firebasestorage\.googleapis\.com\/.*/i,
    /https?:\/\/.*\.s3.*\.amazonaws\.com\/.*/i,
    // Generic patterns
    /https?:\/\/.*\/(image|images|img|photo|photos|media|assets|static|uploads?)\/.*/i,
    // CDN patterns
    /https?:\/\/(cdn|static|media|assets)\..*/i,
  ];

  /**
   * Recursively extract image URLs from a JSON object
   */
  static extractImageUrls(data: unknown, currentPath: string = ''): ExtractedImageInfo[] {
    const images: ExtractedImageInfo[] = [];

    if (!data) return images;

    // Handle strings directly
    if (typeof data === 'string' && this.isImageUrl(data)) {
      images.push({
        url: data,
        path: currentPath || 'root',
        context: {}
      });
      return images;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        const path = `${currentPath}[${index}]`;
        
        // Check if item is directly an image URL
        if (typeof item === 'string' && this.isImageUrl(item)) {
          images.push({
            url: item,
            path: path,
            context: { index }
          });
        } else {
          // Recurse for non-string items
          images.push(...this.extractImageUrls(item, path));
        }
      });
      return images;
    }

    // Handle objects
    if (typeof data === 'object' && data !== null) {
      Object.entries(data).forEach(([key, value]) => {
        const path = currentPath ? `${currentPath}.${key}` : key;
        
        // Special handling for common image field names
        const imageFieldNames = ['imageUrl', 'imageUrls', 'image_url', 'image_urls', 
                                'photo', 'photos', 'picture', 'pictures', 'avatar',
                                'thumbnail', 'cover', 'banner', 'logo', 'icon'];
        
        if (imageFieldNames.includes(key.toLowerCase())) {
          // Handle single string URL
          if (typeof value === 'string' && this.isImageUrl(value)) {
            images.push({
              url: value,
              path: path,
              context: this.getContext(data as Record<string, unknown>, key)
            });
          }
          // Handle array of URLs
          else if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (typeof item === 'string' && this.isImageUrl(item)) {
                images.push({
                  url: item,
                  path: `${path}[${index}]`,
                  context: { ...this.getContext(data as Record<string, unknown>, key), index }
                });
              }
            });
          }
        } else {
          // Check if the value itself is an image URL
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
        }
      });
    }

    // Remove duplicates
    const uniqueImages = images.filter((img, index, self) => 
      index === self.findIndex(i => i.url === img.url)
    );

    return uniqueImages;
  }

  /**
   * Check if a string is an image URL
   */
  static isImageUrl(str: string): boolean {
    if (!str || typeof str !== 'string') return false;
    
    // Normalize the string
    const normalizedStr = str.trim().toLowerCase();
    
    // Quick checks for common patterns
    if (normalizedStr.includes('supabase.co/storage')) return true;
    if (normalizedStr.includes('/uploads/')) return true;
    if (normalizedStr.includes('/images/')) return true;
    if (normalizedStr.includes('/media/')) return true;
    
    // Check against comprehensive patterns
    return this.imageUrlPatterns.some(pattern => pattern.test(str));
  }

  /**
   * Get contextual information around an image
   */
  static getContext(obj: Record<string, unknown>, imageKey: string): Record<string, unknown> {
    const context: Record<string, unknown> = {};
    
    // Look for common metadata fields
    const metadataKeys = ['alt', 'title', 'caption', 'description', 'name', 'label'];
    
    metadataKeys.forEach(key => {
      // Check for direct properties
      if (obj[key]) context[key] = obj[key];
      
      // Check for related properties
      const variations = [
        `${imageKey}_${key}`,
        `${imageKey}${key.charAt(0).toUpperCase() + key.slice(1)}`,
        `${key}_text`,
        `${key}Text`
      ];
      
      variations.forEach(variant => {
        if (obj[variant]) context[key] = obj[variant];
      });
    });

    // Add the parent object's name/title if available
    if (obj.name) context.parentName = obj.name;
    if (obj.title) context.parentTitle = obj.title;

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
      console.log(`Attempting to download: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PayloadCMS/1.0)'
        }
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch image: ${url} - Status: ${response.status}`);
        return null;
      }

      const buffer = await response.buffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      // Generate filename from URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      let filename = pathParts[pathParts.length - 1] || 'image';
      
      // Clean up filename
      filename = decodeURIComponent(filename);
      
      // Ensure filename has an extension
      if (!filename.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)) {
        const ext = contentType.split('/')[1] || 'jpg';
        filename = `${filename}.${ext}`;
      }

      // Sanitize filename
      filename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');

      console.log(`Successfully downloaded: ${url} as ${filename}`);

      return {
        buffer,
        mimeType: contentType,
        filename
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