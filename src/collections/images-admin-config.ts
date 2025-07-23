// src/collections/images-admin-config.ts
import { CollectionConfig } from 'payload'

export const Images: CollectionConfig = {
  slug: 'images',
  admin: {
    useAsTitle: 'alt',
    group: 'Image Manager',
    defaultColumns: ['url', 'tailorName', 'sourceCollection'],
    listSearchableFields: ['tailorName', 'sourceCollection'],
    // Force hide system fields
    hidden: (args) => {
      // This function can be used to conditionally hide the collection
      return false;
    },
    components: {
      // Fix: Remove the component that returns null to avoid serialization issues
      // BeforeListTable components should return valid React elements or be omitted
    },
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
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
    adminThumbnail: 'thumbnail',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        disableListColumn: true,
        hidden: true, // Hide from edit form too if needed
      },
    },
    {
      name: 'tailorName',
      type: 'text',
      label: 'Tailor Name',
      admin: {
        width: '30%', // Set column width
      },
    },
    {
      name: 'sourceCollection',
      type: 'text',
      label: 'Source Collection',
      admin: {
        description: 'The collection where this image was extracted from',
        readOnly: true,
        width: '30%', // Set column width
      },
    },
    // Make all other fields sidebar-only and hidden from list
    {
      name: 'sourceUrl',
      type: 'text',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        hidden: true,
      },
    },
    {
      name: 'sourceDocumentId',
      type: 'text',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        hidden: true,
      },
    },
    {
      name: 'jsonPath',
      type: 'text',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        hidden: true,
      },
    },
    {
      name: 'extractedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        hidden: true,
      },
    },
    {
      name: 'isAutoExtracted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        hidden: true,
      },
    },
  ],
}