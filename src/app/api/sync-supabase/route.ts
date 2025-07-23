// src/app/api/sync-supabase/route.ts
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { supabase } from '@/utils/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';
import { ImageExtractor } from '@/utils/imageExtractor';

interface SupabaseRecord {
  id: string | number;
  title?: string;
  name?: string;
  [key: string]: unknown;
}

interface PayloadDoc {
  id: string | number;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    const { tableName, collectionSlug } = await request.json();

    if (!tableName || !collectionSlug) {
      return NextResponse.json(
        { error: 'tableName and collectionSlug are required' },
        { status: 400 }
      );
    }

    // Fetch data from Supabase
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch data from Supabase' },
        { status: 500 }
      );
    }

    let created = 0;
    let updated = 0;
    let failed = 0;
    let imagesExtracted = 0;

    // Process each record
    for (const record of (data as SupabaseRecord[]) || []) {
      try {
        // Check if record already exists
        const existing = await payload.find({
          collection: collectionSlug,
          where: {
            id: {
              equals: record.id,
            },
          },
          limit: 1,
        });

        let docId: string | number;

        if (existing.docs.length > 0) {
          // Update existing record
          const updatedDoc = await payload.update({
            collection: collectionSlug,
            id: existing.docs[0].id,
            data: record as PayloadDoc,
          });
          updated++;
          docId = updatedDoc.id;
        } else {
          // Create new record
          const createdDoc = await payload.create({
            collection: collectionSlug,
            data: record as PayloadDoc,
          });
          created++;
          docId = createdDoc.id;
        }

        // Extract images from the record
        const imageCount = await extractImagesFromRecord(
          payload,
          record,
          collectionSlug,
          docId
        );
        imagesExtracted += imageCount;

      } catch (error) {
        console.error(`Error processing record ${record.id}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      stats: {
        total: data?.length || 0,
        created,
        updated,
        failed,
        imagesExtracted,
      },
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function extractImagesFromRecord(
  payload: ReturnType<typeof getPayload> extends Promise<infer T> ? T : never,
  record: SupabaseRecord,
  collectionSlug: string,
  docId: string | number
): Promise<number> {
  let extractedCount = 0;

  try {
    // Find JSON fields in the record
    const jsonFields = Object.keys(record).filter(key => {
      const value = record[key];
      return value && typeof value === 'object' && !(value instanceof Date);
    });

    const extractedImageIds: number[] = [];

    for (const fieldName of jsonFields) {
      const fieldData = record[fieldName];
      
      // Extract images from this field
      const images = ImageExtractor.extractImageUrls(fieldData, fieldName);
      
      for (const imageInfo of images) {
        try {
          // Check if image already exists
          const exists = await ImageExtractor.imageExists(payload, imageInfo.url);
          if (exists) continue;

          // Download and create image
          const imageData = await ImageExtractor.downloadImage(imageInfo.url);
          if (!imageData) continue;

          const createdImage = await payload.create({
            collection: 'images',
            data: {
              alt: `${record.name || record.title || 'Item'} - ${fieldName}`,
              tailorName: record.name || null,
              sourceUrl: imageInfo.url,
              sourceCollection: collectionSlug,
              sourceDocumentId: docId.toString(),
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
          extractedCount++;
        } catch (error) {
          console.error(`Failed to extract image: ${imageInfo.url}`, error);
        }
      }
    }

    // Update the document with extracted image references if it has that field
    if (extractedImageIds.length > 0 && collectionSlug === 'tailors') {
      try {
        await payload.update({
          collection: collectionSlug,
          id: docId,
          data: {
            extractedImages: extractedImageIds,
          },
        });
      } catch (error) {
        console.error('Failed to update extractedImages field:', error);
      }
    }

  } catch (error) {
    console.error(`Error extracting images from record ${docId}:`, error);
  }

  return extractedCount;
}