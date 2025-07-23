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

const ImageManagerDashboard: React.FC = () => {
  const [stats, setStats] = useState<ImageStats>({
    totalImages: 0,
    autoExtracted: 0,
    byCollection: {},
  });
  const [syncing, setSyncing] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

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
      const data = await response.json();
      
      if (data.docs) {
        const autoExtracted = data.docs.filter((img: { isAutoExtracted: boolean }) => img.isAutoExtracted).length;
        const byCollection = data.docs.reduce((acc: Record<string, number>, img: { sourceCollection?: string }) => {
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
      <h1>Image Manager Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Total Images</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalImages}</p>
        </div>
        
        <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Auto-Extracted</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.autoExtracted}</p>
        </div>
        
        <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Extraction Rate</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {stats.totalImages > 0 ? `${Math.round((stats.autoExtracted / stats.totalImages) * 100)}%` : '0%'}
          </p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Sync from Supabase</h3>
        
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
          disabled={syncing}
        >
          <option value="">-- Select a table --</option>
          {supabaseTables.map(table => (
            <option key={table.value} value={table.value}>{table.label}</option>
          ))}
        </select>

        <button
          onClick={handleSync}
          disabled={syncing || !selectedTable}
          style={{
            padding: '8px 24px',
            borderRadius: '6px',
            background: syncing || !selectedTable ? '#ccc' : '#2563eb',
            color: 'white',
            border: 'none',
            cursor: syncing || !selectedTable ? 'not-allowed' : 'pointer',
          }}
        >
          {syncing ? 'Syncing...' : 'Sync & Extract Images'}
        </button>

        {syncResult && (
          <div style={{ marginTop: '16px', padding: '16px', background: syncResult.error ? '#fee' : '#efe' }}>
            {syncResult.error ? syncResult.error : `Sync completed! Created: ${syncResult.stats?.created}, Updated: ${syncResult.stats?.updated}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageManagerDashboard;