// src/components/ExtractImagesButton.tsx
'use client';

import React, { useState } from 'react';

interface ExtractImagesButtonProps {
  collectionSlug: string;
  documentId?: string | number;
}

interface ExtractResult {
  success?: boolean;
  error?: string;
  stats?: {
    imagesExtracted?: number;
  };
}

export const ExtractImagesButton: React.FC<ExtractImagesButtonProps> = ({ 
  collectionSlug, 
  documentId 
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractResult | null>(null);

  const handleExtract = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/bulk-extract-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionSlug,
          documentId,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <button
        onClick={handleExtract}
        disabled={loading}
        style={{
          padding: '8px 16px',
          backgroundColor: loading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Extracting...' : 'Extract Images'}
      </button>
      
      {result && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: result.error ? '#ffebee' : '#e8f5e9',
          borderRadius: '4px',
          fontSize: '14px',
        }}>
          {result.error ? (
            <span style={{ color: '#c62828' }}>Error: {result.error}</span>
          ) : (
            <span style={{ color: '#2e7d32' }}>
              Extracted {result.stats?.imagesExtracted || 0} images
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ExtractImagesButton;