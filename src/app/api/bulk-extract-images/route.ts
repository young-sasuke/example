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

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    const body = await request.json();
    const { collectionSlug, documentId } = body;

    if (!collectionSlug) {
      return NextResponse.json(
        { error: 'collectionSlug is required' },
        { status: 400 }
      );
    }

    // Build query
    const query: any = {
      collection: collectionSlug,
      limit: 1000,
    };

    // If documentId provided, only process that document
    if (documentId) {
      query.where = {
        id: {
          equals: documentId,
        },
      };
    }

    const { docs } = await payload.find(query);

    let totalExtracted = 0;
    let failed = 0;
    const processedDocs: any[] = [];

    for (const doc of docs as DocumentData[]) {
      const docResult = {
        id: doc.id,
        name: doc.name || doc.tailor_name || 'Unknown',
        imagesFound: 0,
        imagesCreated: 0,
        errors: [] as string[],
      };

      try {
        // Find all object/array fields that might contain images
        const potentialImageFields = Object.entries(doc).filter(([key, value]) => {
          return value && typeof value === 'object' && !(value instanceof Date) && key !== '_id';
        });

        const extractedImageIds: number[] = [];

        for (const [fieldName, fieldData] of potentialImageFields) {
          // Extract images from this field
          const images = ImageExtractor.extractImageUrls(fieldData, fieldName);
          docResult.imagesFound += images.length;
          
          for (const imageInfo of images) {
            try {
              // Check if already exists
              const exists = await ImageExtractor.imageExists(payload, imageInfo.url);
              if (exists) {
                console.log(`Image already exists: ${imageInfo.url}`);
                continue;
              }

              // Download and create image
              const imageData = await ImageExtractor.downloadImage(imageInfo.url);
              if (!imageData) {
                docResult.errors.push(`Failed to download: ${imageInfo.url}`);
                continue;
              }

              const createdImage = await payload.create({
                collection: 'images',
                data: {
                  alt: (imageInfo.context.alt as string) || 
                       `${doc.name || doc.tailor_name || 'Item'} - ${fieldName}`,
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

              extractedImageIds.push(createdImage.id);
              totalExtracted++;
              docResult.imagesCreated++;
            } catch (error) {
              console.error(`Failed to process image: ${imageInfo.url}`, error);
              docResult.errors.push(`${imageInfo.url}: ${error}`);
              failed++;
            }
          }
        }

        // Update the document with extracted images if it has that field
        if (extractedImageIds.length > 0 && collectionSlug === 'tailors') {
          try {
            const existingDoc = await payload.findByID({
              collection: collectionSlug,
              id: doc.id,
            });

            const currentImages = existingDoc.extractedImages || [];
            const allImageIds = [...new Set([...currentImages, ...extractedImageIds])];

            await payload.update({
              collection: collectionSlug,
              id: doc.id,
              data: {
                extractedImages: allImageIds,
              },
            });
          } catch (error) {
            console.error('Failed to update extractedImages:', error);
          }
        }

        processedDocs.push(docResult);
      } catch (error) {
        console.error(`Failed to process document ${doc.id}:`, error);
        docResult.errors.push(`Document processing error: ${error}`);
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
      details: processedDocs,
    });
  } catch (error) {
    console.error('Bulk extraction error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}