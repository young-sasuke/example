// src/hooks/autoExtractImages.ts
import { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload';
import { ImageExtractor } from '../utils/imageExtractor';

interface ExtractedImageInfo {
  url: string;
  path: string;
  context: Record<string, unknown>;
}

/**
 * Hook to automatically extract and upload images from JSON fields
 */
export const autoExtractImagesHook: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  collection,
}) => {
  // Only process on create or update operations
  if (operation !== 'create' && operation !== 'update') {
    return doc;
  }

  try {
    // Find all JSON fields in the document
    const jsonFields: string[] = [];
    collection.fields.forEach((field) => {
      if (field.type === 'json') {
        jsonFields.push(field.name);
      }
    });

    // Extract images from each JSON field
    const allExtractedImages: ExtractedImageInfo[] = [];
    
    for (const fieldName of jsonFields) {
      const fieldData = doc[fieldName];
      if (fieldData) {
        const extractedImages = ImageExtractor.extractImageUrls(fieldData, fieldName);
        allExtractedImages.push(...extractedImages);
      }
    }

    // Process each extracted image
    for (const imageInfo of allExtractedImages) {
      try {
        // Check if image already exists
        const exists = await ImageExtractor.imageExists(req.payload, imageInfo.url);
        if (exists) {
          console.log(`Image already exists: ${imageInfo.url}`);
          continue;
        }

        // Download the image
        const imageData = await ImageExtractor.downloadImage(imageInfo.url);
        if (!imageData) {
          console.error(`Failed to download image: ${imageInfo.url}`);
          continue;
        }

        // Create the image document
        await req.payload.create({
          collection: 'images',
          data: {
            alt: (imageInfo.context.alt as string) || (imageInfo.context.title as string) || `Image from ${collection.slug}`,
            tailorName: (doc.name as string) || (doc.tailor_name as string) || null,
            sourceUrl: imageInfo.url,
            sourceCollection: collection.slug,
            sourceDocumentId: doc.id.toString(),
            jsonPath: imageInfo.path,
            extractedAt: new Date().toISOString(),
            isAutoExtracted: true,
          },
          file: {
            data: imageData.buffer,
            mimetype: imageData.mimeType,
            name: imageData.filename,
            size: imageData.buffer.length,
          },
          req,
        });

        console.log(`Successfully extracted and uploaded image: ${imageInfo.url}`);
      } catch (error) {
        console.error(`Error processing image ${imageInfo.url}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in autoExtractImagesHook:', error);
  }

  return doc;
};

/**
 * Hook to track image URLs before change for comparison
 */
export const trackImageUrlsBeforeChange: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (operation === 'update' && originalDoc) {
    // Store original image URLs in request context for comparison
    req.context = {
      ...req.context,
      originalImageUrls: new Set<string>(),
    };

    // Extract original image URLs
    const jsonFields = Object.keys(originalDoc).filter(key => 
      typeof originalDoc[key] === 'object' && originalDoc[key] !== null
    );

    jsonFields.forEach(fieldName => {
      const fieldData = originalDoc[fieldName];
      if (fieldData) {
        const images = ImageExtractor.extractImageUrls(fieldData, fieldName);
        images.forEach(img => (req.context.originalImageUrls as Set<string>).add(img.url));
      }
    });
  }

  return data;
};