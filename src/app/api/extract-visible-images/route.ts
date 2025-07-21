// src/app/api/extract-visible-images/route.ts
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { NextRequest, NextResponse } from 'next/server';

// Define interfaces for type safety
interface TailorWithBoutiqueItems {
  id: string | number;
  name?: string;
  boutique_items?: {
    imageUrls?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}

interface ProcessingResults {
  processed: number;
  created: number;
  failed: number;
  errors: Array<{
    url: string;
    error: string;
  }>;
}

interface TailorReport {
  totalTailors: number;
  tailorsWithBoutiqueItems: number;
  totalImagesFound: number;
  sampleTailors: Array<{
    id: string | number;
    name?: string;
    imageCount: number;
    sampleUrls: string[];
  }>;
}

export async function POST(_request: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    // Sample URLs from your screenshot
    const sampleImageUrls = [
      "https://zppnuawaqekfdpoexsxz.supabase.co/storage/v1/object/public/tailors/tailors/Manish Tailoring & Boutique Services/1743484524004.jpg",
      "https://zppnuawaqekfdpoexsxz.supabase.co/storage/v1/object/public/tailors/tailors/Manish Tailoring & Boutique Services/1743484526748.jpg",
      "https://zppnuawaqekfdpoexsxz.supabase.co/storage/v1/object/public/tailors/tailors/Manish Tailoring & Boutique Services/1743484528378.jpg",
      "https://zppnuawaqekfdpoexsxz.supabase.co/storage/v1/object/public/tailors/tailors/Manish Tailoring & Boutique Services/1743484529314.jpg"
    ];

    const results: ProcessingResults = {
      processed: 0,
      created: 0,
      failed: 0,
      errors: []
    };

    // First, let's try to process these sample URLs
    for (const imageUrl of sampleImageUrls) {
      results.processed++;
      
      try {
        // Check if already exists
        const existing = await payload.find({
          collection: 'images',
          where: {
            sourceUrl: {
              equals: imageUrl,
            },
          },
          limit: 1,
        });

        if (existing.docs.length > 0) {
          console.log(`Image already exists: ${imageUrl}`);
          continue;
        }

        // Download the image
        console.log(`Downloading: ${imageUrl}`);
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        
        // Extract filename from URL
        const urlParts = imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1] || 'image.jpg';

        // Create in Payload
        console.log(`Creating image in Payload...`);
        const createdImage = await payload.create({
          collection: 'images',
          data: {
            alt: `Manish Tailoring & Boutique Services - Image`,
            tailorName: 'Manish Tailoring & Boutique Services',
            sourceUrl: imageUrl,
            sourceCollection: 'tailors',
            sourceDocumentId: 'a51tthg',
            jsonPath: 'boutique_items.imageUrls',
            extractedAt: new Date().toISOString(),
            isAutoExtracted: true,
          },
          file: {
            data: Buffer.from(buffer),
            mimetype: contentType,
            name: filename,
            size: buffer.byteLength,
          },
        });

        console.log(`Created image: ${createdImage.id}`);
        results.created++;

      } catch (error) {
        console.error(`Error processing ${imageUrl}:`, error);
        results.failed++;
        results.errors.push({
          url: imageUrl,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Now let's also check all tailors for boutique_items
    const { docs: tailors } = await payload.find({
      collection: 'tailors',
      limit: 50,
    });

    const tailorReport: TailorReport = {
      totalTailors: tailors.length,
      tailorsWithBoutiqueItems: 0,
      totalImagesFound: 0,
      sampleTailors: []
    };

    for (const tailor of tailors as TailorWithBoutiqueItems[]) {
      if (tailor.boutique_items) {
        tailorReport.tailorsWithBoutiqueItems++;
        
        // Check if boutique_items has imageUrls array
        if (tailor.boutique_items.imageUrls && Array.isArray(tailor.boutique_items.imageUrls)) {
          tailorReport.totalImagesFound += tailor.boutique_items.imageUrls.length;
          
          // Add sample
          if (tailorReport.sampleTailors.length < 3) {
            tailorReport.sampleTailors.push({
              id: tailor.id,
              name: tailor.name,
              imageCount: tailor.boutique_items.imageUrls.length,
              sampleUrls: tailor.boutique_items.imageUrls.slice(0, 2)
            });
          }

          // Process these images
          for (const imageUrl of tailor.boutique_items.imageUrls) {
            try {
              // Check if already exists
              const exists = await payload.find({
                collection: 'images',
                where: {
                  sourceUrl: {
                    equals: imageUrl,
                  },
                },
                limit: 1,
              });

              if (exists.docs.length > 0) continue;

              // Download and create
              const response = await fetch(imageUrl);
              if (!response.ok) continue;

              const buffer = await response.arrayBuffer();
              const filename = imageUrl.split('/').pop() || 'image.jpg';

              await payload.create({
                collection: 'images',
                data: {
                  alt: `${tailor.name || 'Tailor'} - Boutique Item`,
                  tailorName: tailor.name || null,
                  sourceUrl: imageUrl,
                  sourceCollection: 'tailors',
                  sourceDocumentId: tailor.id.toString(),
                  jsonPath: 'boutique_items.imageUrls',
                  extractedAt: new Date().toISOString(),
                  isAutoExtracted: true,
                },
                file: {
                  data: Buffer.from(buffer),
                  mimetype: 'image/jpeg',
                  name: filename,
                  size: buffer.byteLength,
                },
              });

              results.created++;
            } catch (_error) {
              results.failed++;
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Images extracted successfully',
      results,
      tailorReport,
    });

  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json({
      error: 'Extraction failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}