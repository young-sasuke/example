// src/app/api/extract-from-supabase/route.ts
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { supabase } from '@/utils/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';
import { ImageExtractor } from '@/utils/imageExtractor';

// Define the interface for the Tailor type from Supabase
interface SupabaseTailor {
  id: string | number;
  name?: string;
  boutique_items?: any;
  profile?: any;
  alterations?: any;
  tailorings?: any;
  rents?: any;
  [key: string]: any; // Index signature for dynamic field access
}

interface ExtractResults {
  tailorsChecked: number;
  imagesFound: number;
  imagesCreated: number;
  errors: Array<{
    url: string;
    error: string;
  }>;
  sampleData: Array<{
    id: string | number;
    name?: string;
    hasProfile: boolean;
    hasBoutiqueItems: boolean;
    profileSample: string | null;
    boutiqueItemsSample: string | null;
  }>;
}

export async function POST(_request: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    // Fetch tailors directly from Supabase
    const { data: tailors, error } = await supabase
      .from('tailors')
      .select('*')
      .limit(10);

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    const results: ExtractResults = {
      tailorsChecked: 0,
      imagesFound: 0,
      imagesCreated: 0,
      errors: [],
      sampleData: [],
    };

    for (const tailor of (tailors as SupabaseTailor[]) || []) {
      results.tailorsChecked++;
      
      // Add sample data for debugging
      if (results.sampleData.length < 3) {
        results.sampleData.push({
          id: tailor.id,
          name: tailor.name,
          hasProfile: !!tailor.profile,
          hasBoutiqueItems: !!tailor.boutique_items,
          profileSample: tailor.profile ? JSON.stringify(tailor.profile).substring(0, 100) : null,
          boutiqueItemsSample: tailor.boutique_items ? JSON.stringify(tailor.boutique_items).substring(0, 100) : null,
        });
      }

      // Check each JSON field
      const jsonFields = ['boutique_items', 'profile', 'alterations', 'tailorings', 'rents'] as const;
      
      for (const field of jsonFields) {
        const fieldData = tailor[field];
        
        if (fieldData) {
          const images = ImageExtractor.extractImageUrls(fieldData, field);
          results.imagesFound += images.length;
          
          for (const imageInfo of images) {
            try {
              // Check if already exists
              const exists = await ImageExtractor.imageExists(payload, imageInfo.url);
              if (exists) continue;

              // Download and create
              const imageData = await ImageExtractor.downloadImage(imageInfo.url);
              if (!imageData) continue;

              await payload.create({
                collection: 'images',
                data: {
                  alt: `${tailor.name || 'Tailor'} - ${field}`,
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

              results.imagesCreated++;
            } catch (error) {
              results.errors.push({
                url: imageInfo.url,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Checked ${results.tailorsChecked} tailors from Supabase, found ${results.imagesFound} images, created ${results.imagesCreated}`,
    });

  } catch (error) {
    console.error('Supabase extraction error:', error);
    return NextResponse.json({
      error: 'Extraction failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}