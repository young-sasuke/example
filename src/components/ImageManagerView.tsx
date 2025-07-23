// src/components/ImageManagerView.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ImageManagerDashboard = dynamic(() => import('./ImageManagerDashboard'), {
  ssr: false,
});

const ImageManagerView: React.FC = () => {
  return <ImageManagerDashboard />;
};

export default ImageManagerView;