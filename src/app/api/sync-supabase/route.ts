// src/app/api/sync-supabase/route.ts
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { supabase } from '@/utils/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

interface SupabaseRecord {
  id: string | number;
  title?: string;
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

        if (existing.docs.length > 0) {
          // Update existing record
          await payload.update({
            collection: collectionSlug,
            id: existing.docs[0].id,
            data: record as any,
          });
          updated++;
        } else {
          // Create new record
          await payload.create({
            collection: collectionSlug,
            data: record as any,
          });
          created++;
        }
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