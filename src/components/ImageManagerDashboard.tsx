// src/components/ImageManagerDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface ImageStats {
  totalImages: number;
  autoExtracted: number;
  byCollection: Record<string, number>;
}

interface SyncResult {
  success?: boolean;
  message?: string;
  error?: string;
  stats?: {
    total: number;
    created: number;
    updated: number;
    failed: number;
  };
}

interface ImageDoc {
  id: string;
  isAutoExtracted: boolean;
  sourceCollection?: string;
}

interface ImagesResponse {
  docs: ImageDoc[];
  totalDocs: number;
}

const ImageManagerDashboard: React.FC = () => {
  const [stats, setStats] = useState<ImageStats>({
    totalImages: 0,
    autoExtracted: 0,
    byCollection: {},
  });
  const [syncing, setSyncing] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  // Supabase tables that might contain images
  const supabaseTables = [
    { value: 'tailors', label: 'Tailors', collection: 'tailors' },
    { value: 'featured_products', label: 'Featured Products', collection: 'featured_products' },
    { value: 'boys_clothing', label: 'Boys Clothing', collection: 'boys_clothing' },
    { value: 'girls_clothing', label: 'Girls Clothing', collection: 'girls_clothing' },
    { value: 'men_clothing', label: 'Men Clothing', collection: 'men_clothing' },
    { value: 'women_clothing', label: 'Women Clothing', collection: 'women_clothing' },
  ];

  useEffect(() => {
    fetchImageStats();
  }, []);

  const fetchImageStats = async () => {
    try {
      const response = await fetch('/api/images?limit=1000');
      const data: ImagesResponse = await response.json();
      
      if (data.docs) {
        const autoExtracted = data.docs.filter((img: ImageDoc) => img.isAutoExtracted).length;
        const byCollection = data.docs.reduce((acc: Record<string, number>, img: ImageDoc) => {
          if (img.sourceCollection) {
            acc[img.sourceCollection] = (acc[img.sourceCollection] || 0) + 1;
          }
          return acc;
        }, {});

        setStats({
          totalImages: data.totalDocs,
          autoExtracted,
          byCollection,
        });
      }
    } catch (error) {
      console.error('Failed to fetch image stats:', error);
    }
  };

  const handleSync = async () => {
    if (!selectedTable) {
      alert('Please select a table to sync');
      return;
    }

    setSyncing(true);
    setSyncResult(null);

    try {
      const selected = supabaseTables.find(t => t.value === selectedTable);
      if (!selected) return;

      const response = await fetch('/api/sync-supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName: selectedTable,
          collectionSlug: selected.collection,
        }),
      });

      const result = await response.json();
      setSyncResult(result);
      
      // Refresh stats after sync
      setTimeout(fetchImageStats, 2000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncResult({ error: 'Sync failed. Please try again.' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '32px' }}>Image Manager Dashboard</h1>
      
      {/* Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '8px' }}>Total Images</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>{stats.totalImages}</p>
        </div>
        
        <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '8px' }}>Auto-Extracted</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>{stats.autoExtracted}</p>
        </div>
        
        <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '8px' }}>Extraction Rate</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6', margin: 0 }}>
            {stats.totalImages > 0 
              ? `${Math.round((stats.autoExtracted / stats.totalImages) * 100)}%`
              : '0%'
            }
          </p>
        </div>
      </div>

      {/* Images by Collection */}
      <div style={{ background: 'white', borderRadius: '8px', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>Images by Collection</h3>
        <div>
          {Object.entries(stats.byCollection).map(([collection, count]) => (
            <div key={collection} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ textTransform: 'capitalize' }}>{collection.replace('_', ' ')}</span>
              <span style={{ fontWeight: '600' }}>{count}</span>
            </div>
          ))}
          {Object.keys(stats.byCollection).length === 0 && (
            <p style={{ color: '#6b7280' }}>No images extracted yet</p>
          )}
        </div>
      </div>

      {/* Sync Section */}
      <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>Sync from Supabase</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
            Select Table to Sync
          </label>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            disabled={syncing}
          >
            <option value="">-- Select a table --</option>
            {supabaseTables.map(table => (
              <option key={table.value} value={table.value}>
                {table.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing || !selectedTable}
          style={{
            padding: '8px 24px',
            borderRadius: '6px',
            fontWeight: '500',
            background: syncing || !selectedTable ? '#e5e7eb' : '#2563eb',
            color: syncing || !selectedTable ? '#6b7280' : 'white',
            border: 'none',
            cursor: syncing || !selectedTable ? 'not-allowed' : 'pointer',
          }}
        >
          {syncing ? 'Syncing...' : 'Sync & Extract Images'}
        </button>

        {/* Sync Result */}
        {syncResult && (
          <div style={{
            marginTop: '16px',
            padding: '16px',
            borderRadius: '6px',
            background: syncResult.error ? '#fee2e2' : '#d1fae5',
            color: syncResult.error ? '#991b1b' : '#065f46',
          }}>
            {syncResult.error ? (
              <p>{syncResult.error}</p>
            ) : (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '8px' }}>Sync completed successfully!</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem' }}>
                  <li>Total records: {syncResult.stats?.total}</li>
                  <li>Created: {syncResult.stats?.created}</li>
                  <li>Updated: {syncResult.stats?.updated}</li>
                  {syncResult.stats?.failed && syncResult.stats.failed > 0 && (
                    <li style={{ color: '#dc2626' }}>Failed: {syncResult.stats.failed}</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '32px', background: '#eff6ff', borderRadius: '8px', padding: '24px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px' }}>How it works:</h3>
        <ol style={{ listStyleType: 'decimal', paddingLeft: '20px', fontSize: '0.875rem' }}>
          <li>Select a Supabase table from the dropdown</li>
          <li>Click &ldquo;Sync &amp; Extract Images&rdquo; to fetch data from Supabase</li>
          <li>The system will automatically extract any image URLs found in JSON fields</li>
          <li>Extracted images are stored in the Images collection for easy management</li>
          <li>Images are automatically linked back to their source documents</li>
        </ol>
      </div>
    </div>
  );
};

export default ImageManagerDashboard;