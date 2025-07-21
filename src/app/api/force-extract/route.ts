// src/app/api/force-extract/route.ts
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { NextRequest, NextResponse } from 'next/server';
import { ImageExtractor } from '@/utils/imageExtractor';

// Define interfaces for type safety
interface TailorWithExtractableFields {
  id: string | number;
  name?: string;
  extractedImages?: any[];
  boutique_items?: any;
  profile?: any;
  alterations?: any;
  tailorings?: any;
  rents?: any;
  [key: string]: any; // Index signature for dynamic field access
}

interface ExtractionResults {
  processed: number;
  imagesFound: number;
  imagesCreated: number;
  imagesFailed: number;
  errors: Array<{
    url?: string;
    tailorId?: string | number;
    error: string;
  }>;
}

interface RequestBody {
  limit?: number;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    const body: RequestBody = await request.json();
    const limit = body.limit || 10; // Process limited number of tailors at once

    // Get tailors
    const { docs: tailors } = await payload.find({
      collection: 'tailors',
      limit: limit,
    });

    const results: ExtractionResults = {
      processed: 0,
      imagesFound: 0,
      imagesCreated: 0,
      imagesFailed: 0,
      errors: [],
    };

    for (const tailor of tailors as TailorWithExtractableFields[]) {
      results.processed++;
      
      try {
        // Check each JSON field
        const jsonFields = ['boutique_items', 'profile', 'alterations', 'tailorings', 'rents'] as const;
        
        for (const field of jsonFields) {
          const fieldData = tailor[field];
          
          if (fieldData && typeof fieldData === 'object' && Object.keys(fieldData).length > 0) {
            // Extract images from this field
            const images = ImageExtractor.extractImageUrls(fieldData, field);
            results.imagesFound += images.length;
            
            // Process each image
            for (const imageInfo of images) {
              try {
                // Check if already exists
                const exists = await ImageExtractor.imageExists(payload, imageInfo.url);
                if (exists) {
                  console.log(`Image already exists: ${imageInfo.url}`);
                  continue;
                }

                // Download the image
                console.log(`Downloading image: ${imageInfo.url}`);
                const imageData = await ImageExtractor.downloadImage(imageInfo.url);
                
                if (!imageData) {
                  console.error(`Failed to download: ${imageInfo.url}`);
                  results.imagesFailed++;
                  continue;
                }

                // Create the image in Payload
                console.log(`Creating image in Payload: ${imageInfo.url}`);
                const createdImage = await payload.create({
                  collection: 'images',
                  data: {
                    alt: `Image from ${tailor.name || 'Tailor'} - ${field}`,
                    tailorName: tailor.name || null,
                    sourceUrl: imageInfo.url,
                    sourceCollection: 'tailors',
                    sourceDocumentId: tailor.id.toString(),
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

                console.log(`Successfully created image: ${createdImage.id}`);
                results.imagesCreated++;

                // Update the tailor's extractedImages field if it exists
                if (tailor.extractedImages !== undefined) {
                  const currentImages = Array.isArray(tailor.extractedImages) ? tailor.extractedImages : [];
                  await payload.update({
                    collection: 'tailors',
                    id: tailor.id,
                    data: {
                      extractedImages: [...currentImages, createdImage.id],
                    },
                  });
                }

              } catch (imageError) {
                console.error(`Error processing image ${imageInfo.url}:`, imageError);
                results.errors.push({
                  url: imageInfo.url,
                  error: imageError instanceof Error ? imageError.message : 'Unknown error',
                });
                results.imagesFailed++;
              }
            }
          }
        }
      } catch (tailorError) {
        console.error(`Error processing tailor ${tailor.id}:`, tailorError);
        results.errors.push({
          tailorId: tailor.id,
          error: tailorError instanceof Error ? tailorError.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      results: results,
      message: `Processed ${results.processed} tailors, found ${results.imagesFound} images, created ${results.imagesCreated} new images`,
    }, { status: 200 });

  } catch (error) {
    console.error('Force extraction error:', error);
    return NextResponse.json({
      error: 'Force extraction failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}