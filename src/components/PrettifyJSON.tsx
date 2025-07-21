// src/components/PrettifyJSON.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface PrettifyJSONProps {
  cellData: Record<string, unknown>;
  rowData: Record<string, unknown>;
}

interface ExtractedImage {
  id: string;
  alt: string;
  url: string;
  jsonPath: string;
  sizes?: {
    thumbnail?: {
      url?: string;
    };
  };
}

const PrettifyJSON: React.FC<PrettifyJSONProps> = ({ cellData, rowData }) => {
  const [visibleImages, setVisibleImages] = useState<Record<string, boolean>>({});
  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchExtractedImages = useCallback(async () => {
    try {
      const response = await fetch(`/api/images?where[sourceDocumentId][equals]=${rowData.id}&limit=100`);
      const data = await response.json();
      if (data.docs) {
        setExtractedImages(data.docs);
      }
    } catch (error) {
      console.error('Failed to fetch extracted images:', error);
    }
  }, [rowData.id]);

  useEffect(() => {
    if (rowData?.id) {
      fetchExtractedImages();
    }
  }, [rowData?.id, fetchExtractedImages]);

  if (!cellData) return <span style={{ color: '#888' }}>No Data</span>;

  const toggleImage = (url: string) => {
    setVisibleImages((prev) => ({
      ...prev,
      [url]: !prev[url],
    }));
  };

  const extractImages = (data: unknown, path: string = ''): string[] => {
    const urls: string[] = [];
    
    if (typeof data === 'string' && isImageUrl(data)) {
      urls.push(data);
    } else if (Array.isArray(data)) {
      data.forEach((item, index) => {
        urls.push(...extractImages(item, `${path}[${index}]`));
      });
    } else if (typeof data === 'object' && data !== null) {
      Object.entries(data).forEach(([key, value]) => {
        const newPath = path ? `${path}.${key}` : key;
        urls.push(...extractImages(value, newPath));
      });
    }
    
    return urls;
  };

  const isImageUrl = (str: string): boolean => {
    if (!str || typeof str !== 'string') return false;
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(str) || 
           /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg|bmp)/i.test(str);
  };

  const renderValue = (value: unknown, key?: string) => {
    // Special handling for arrays named imageUrls or similar
    if (Array.isArray(value) && (key === 'imageUrls' || key === 'images')) {
      return (
        <div>
          {value.map((url: string, index: number) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#4fc3f7', textDecoration: 'underline', cursor: 'pointer' }}
                onClick={(e) => {
                  e.preventDefault();
                  toggleImage(url);
                }}
              >
                {visibleImages[url] ? 'Hide Image' : `Show Image ${index + 1}`}
              </a>
              {visibleImages[url] && (
                <div style={{ marginTop: '5px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Check if value is an image URL
    if (typeof value === 'string' && isImageUrl(value)) {
      return (
        <div>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#4fc3f7', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={(e) => {
              e.preventDefault();
              toggleImage(value);
            }}
          >
            {visibleImages[value] ? 'Hide Image' : 'Show Image'}
          </a>
          {visibleImages[value] && (
            <div style={{ marginTop: '5px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Preview"
                style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px' }}
              />
            </div>
          )}
        </div>
      );
    }

    return (
      <pre style={{ margin: 0 }}>
        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
      </pre>
    );
  };

  const allImageUrls = extractImages(cellData);
  const hasImages = allImageUrls.length > 0 || extractedImages.length > 0;

  return (
    <div>
      <div
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          background: '#1e1e1e',
          color: '#fff',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          maxHeight: '300px',
          overflow: 'auto',
          marginBottom: hasImages ? '10px' : 0,
        }}
      >
        {Object.entries(cellData).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '8px' }}>
            <strong>{key}:</strong> {renderValue(value, key)}
          </div>
        ))}
      </div>

      {/* Extracted Images Section */}
      {extractedImages.length > 0 && (
        <div style={{
          background: '#2a2a2a',
          padding: '10px',
          borderRadius: '5px',
          marginTop: '10px',
        }}>
          <h4 style={{ color: '#4fc3f7', margin: '0 0 10px 0', fontSize: '14px' }}>
            📷 Extracted Images ({extractedImages.length})
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '8px' 
          }}>
            {extractedImages.map((img) => (
              <div key={img.id} style={{ textAlign: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.sizes?.thumbnail?.url || img.url}
                  alt={img.alt}
                  style={{ 
                    width: '100%', 
                    height: '60px', 
                    objectFit: 'cover',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  onClick={() => window.open(img.url, '_blank')}
                />
                <p style={{ 
                  fontSize: '10px', 
                  color: '#888',
                  margin: '4px 0 0 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {img.jsonPath}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {allImageUrls.length > 0 && (
        <div style={{
          background: '#2a2a2a',
          padding: '8px',
          borderRadius: '5px',
          fontSize: '11px',
          color: '#888',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>Found {allImageUrls.length} image URL(s) in JSON</span>
          {extractedImages.length < allImageUrls.length && (
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  await fetch('/api/bulk-extract-images', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      collectionSlug: (rowData.collection as string) || 'tailors',
                      documentId: rowData.id 
                    }),
                  });
                  setTimeout(fetchExtractedImages, 2000);
                } catch (error) {
                  console.error('Extract failed:', error);
                }
                setLoading(false);
              }}
              disabled={loading}
              style={{
                background: '#4fc3f7',
                color: '#000',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: '11px',
              }}
            >
              {loading ? 'Extracting...' : 'Extract Missing Images'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PrettifyJSON;