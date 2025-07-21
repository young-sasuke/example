// src/collections/images.ts
import { CollectionConfig } from 'payload'

export const Images: CollectionConfig = {
  slug: 'images',
  admin: {
    useAsTitle: 'alt',
    group: 'Image Manager',
  },
  upload: {
    staticDir: 'images',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        crop: 'center',
      },
      {
        name: 'medium',
        width: 768,
        height: undefined,
        position: 'centre',
      },
      {
        name: 'large',
        width: 1200,
        height: undefined,
        position: 'centre',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'tailorName',
      type: 'text',
    },
    // New fields for tracking image sources
    {
      name: 'sourceUrl',
      type: 'text',
      label: 'Original URL',
      admin: {
        description: 'The original URL where this image was found',
        readOnly: true,
      },
    },
    {
      name: 'sourceCollection',
      type: 'text',
      label: 'Source Collection',
      admin: {
        description: 'The collection where this image was extracted from',
        readOnly: true,
      },
    },
    {
      name: 'sourceDocumentId',
      type: 'text',
      label: 'Source Document ID',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'jsonPath',
      type: 'text',
      label: 'JSON Path',
      admin: {
        description: 'The JSON path where this image was found',
        readOnly: true,
      },
    },
    {
      name: 'extractedAt',
      type: 'date',
      label: 'Extracted At',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'isAutoExtracted',
      type: 'checkbox',
      label: 'Auto Extracted',
      defaultValue: false,
      admin: {
        description: 'Was this image automatically extracted from JSON data?',
        readOnly: true,
      },
    },
  ],
}