// src/app/api/debug-images/route.ts
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { NextRequest, NextResponse } from 'next/server';
import { ImageExtractor } from '@/utils/imageExtractor';

// Define the interface for the Tailor type to help with type safety
interface TailorFields {
  boutique_items?: any;
  profile?: any;
  alterations?: any;
  tailorings?: any;
  rents?: any;
  [key: string]: any; // Index signature for dynamic field access
}

export async function GET(_request: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    // Get first 5 tailors to inspect
    const { docs: tailors } = await payload.find({
      collection: 'tailors',
      limit: 5,
    });

    const report = {
      totalTailors: tailors.length,
      tailorsInspected: [] as any[],
      totalImagesFound: 0,
      imagesByField: {
        boutique_items: 0,
        profile: 0,
        alterations: 0,
        tailorings: 0,
        rents: 0,
      },
      sampleUrls: [] as any[],
    };

    for (const tailor of tailors) {
      const tailorReport = {
        id: tailor.id,
        name: tailor.name || 'No name',
        fieldsWithData: {} as Record<string, any>,
        imagesFound: {} as Record<string, any[]>,
      };

      // Check each JSON field
      const jsonFields = ['boutique_items', 'profile', 'alterations', 'tailorings', 'rents'] as const;
      
      for (const field of jsonFields) {
        // Use type assertion to safely access the field
        const fieldData = (tailor as TailorFields)[field];
        
        if (fieldData) {
          // Check if it's actually an object with data
          const isEmpty = fieldData === null || 
                         (typeof fieldData === 'object' && Object.keys(fieldData).length === 0) ||
                         JSON.stringify(fieldData) === '{}' ||
                         JSON.stringify(fieldData) === '[]';
          
          tailorReport.fieldsWithData[field] = {
            hasData: !isEmpty,
            dataType: typeof fieldData,
            dataPreview: JSON.stringify(fieldData).substring(0, 100) + '...',
          };

          if (!isEmpty) {
            // Extract images from this field
            const images = ImageExtractor.extractImageUrls(fieldData, field);
            
            if (images.length > 0) {
              tailorReport.imagesFound[field] = images.map(img => ({
                url: img.url,
                path: img.path,
              }));
              
              report.imagesByField[field] += images.length;
              report.totalImagesFound += images.length;
              
              // Add sample URLs
              images.forEach(img => {
                if (report.sampleUrls.length < 10) {
                  report.sampleUrls.push({
                    url: img.url,
                    fromTailor: tailor.name || tailor.id,
                    field: field,
                    path: img.path,
                  });
                }
              });
            }
          }
        } else {
          tailorReport.fieldsWithData[field] = {
            hasData: false,
            dataType: 'undefined',
            dataPreview: 'No data',
          };
        }
      }

      report.tailorsInspected.push(tailorReport);
    }

    // Check if any images are already in the images collection
    const { docs: existingImages } = await payload.find({
      collection: 'images',
      limit: 10,
    });

    const reportWithExistingImages = {
      ...report,
      existingImagesInCollection: existingImages.length,
      sampleExistingImages: existingImages.slice(0, 3).map(img => ({
        id: img.id,
        alt: img.alt,
        sourceUrl: img.sourceUrl,
        sourceCollection: img.sourceCollection,
      })),
    };

    return NextResponse.json(reportWithExistingImages, { status: 200 });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}