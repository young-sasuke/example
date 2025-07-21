// src/app/api/bulk-extract-images/route.ts
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { NextRequest, NextResponse } from 'next/server';
import { ImageExtractor } from '@/utils/imageExtractor';

interface DocumentData {
  id: string | number;
  name?: string;
  tailor_name?: string;
  [key: string]: unknown;
}

// Extended type for image creation data
interface ImageCreationData {
  alt: string;
  tailorName?: string | null;
  sourceUrl?: string;
  sourceCollection?: string;
  sourceDocumentId?: string;
  jsonPath?: string;
  extractedAt?: string;
  isAutoExtracted?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    const { collectionSlug } = await request.json();

    if (!collectionSlug) {
      return NextResponse.json(
        { error: 'collectionSlug is required' },
        { status: 400 }
      );
    }

    // Get all documents from the collection
    const { docs } = await payload.find({
      collection: collectionSlug,
      limit: 1000, // Adjust as needed
    });

    let totalExtracted = 0;
    let failed = 0;

    for (const doc of docs as DocumentData[]) {
      try {
        // Find JSON fields in the document
        const jsonData: Record<string, unknown> = {};
        Object.keys(doc).forEach(key => {
          const value = doc[key];
          if (typeof value === 'object' && value !== null && 
              !Array.isArray(value) && !(value instanceof Date)) {
            jsonData[key] = value;
          }
        });

        // Extract images from JSON fields
        for (const [fieldName, data] of Object.entries(jsonData)) {
          // Special handling for boutique_items which has imageUrls array
          if (fieldName === 'boutique_items' && data && typeof data === 'object') {
            const boutiqueData = data as any;
            if (boutiqueData.imageUrls && Array.isArray(boutiqueData.imageUrls)) {
              for (const imageUrl of boutiqueData.imageUrls) {
                const imageInfo = {
                  url: imageUrl,
                  path: `${fieldName}.imageUrls`,
                  context: { alt: `${doc.name || 'Tailor'} - Boutique Item` }
                };
                // Process this image
                try {
                  // Check if already exists
                  const exists = await ImageExtractor.imageExists(payload, imageInfo.url);
                  if (exists) continue;

                  // Download and create image
                  const imageData = await ImageExtractor.downloadImage(imageInfo.url);
                  if (!imageData) continue;

                  await payload.create({
                    collection: 'images',
                    data: {
                      alt: (imageInfo.context.alt as string) || `Image from ${collectionSlug}`,
                      tailorName: (doc.name as string) || (doc.tailor_name as string) || null,
                      sourceUrl: imageInfo.url,
                      sourceCollection: collectionSlug,
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
                  });

                  totalExtracted++;
                } catch (error) {
                  console.error(`Failed to process image: ${imageInfo.url}`, error);
                  failed++;
                }
              }
              continue;
            }
          }
          
          // Regular extraction for other fields
          const images = ImageExtractor.extractImageUrls(data, fieldName);
          
          for (const imageInfo of images) {
            try {
              // Check if already exists
              const exists = await ImageExtractor.imageExists(payload, imageInfo.url);
              if (exists) continue;

              // Download and create image
              const imageData = await ImageExtractor.downloadImage(imageInfo.url);
              if (!imageData) continue;

              // Create the data object with proper typing
              const creationData: ImageCreationData = {
                alt: (imageInfo.context.alt as string) || `Image from ${collectionSlug}`,
                tailorName: (doc.name as string) || (doc.tailor_name as string) || null,
                sourceUrl: imageInfo.url,
                sourceCollection: collectionSlug,
                sourceDocumentId: doc.id.toString(),
                jsonPath: imageInfo.path,
                extractedAt: new Date().toISOString(),
                isAutoExtracted: true,
              };

              await payload.create({
                collection: 'images',
                data: creationData as any, // Type assertion to bypass strict typing
                file: {
                  data: imageData.buffer,
                  mimetype: imageData.mimeType,
                  name: imageData.filename,
                  size: imageData.buffer.length,
                },
              });

              totalExtracted++;
            } catch (error) {
              console.error(`Failed to process image: ${imageInfo.url}`, error);
              failed++;
            }
          }
        }
      } catch (error) {
        console.error(`Failed to process document ${doc.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Bulk extraction completed',
      stats: {
        documentsProcessed: docs.length,
        imagesExtracted: totalExtracted,
        failed,
      },
    });
  } catch (error) {
    console.error('Bulk extraction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}