import type { CollectionConfig } from 'payload';

// Inline the hooks instead of importing
const trackImageUrlsBeforeChange = async ({ data, _req, operation, originalDoc }: any) => {
  if (operation === 'update' && originalDoc) {
    _req.context = {
      ..._req.context,
      originalImageUrls: new Set<string>(),
    };
  }
  return data;
};

const autoExtractImagesHook = async ({ doc, _req, operation, _collection }: any) => {
  if (operation !== 'create' && operation !== 'update') {
    return doc;
  }
  // Add extraction logic if needed
  return doc;
};

export const Tailors: CollectionConfig = {
  slug: 'tailors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'email',
      'phone_number',
      'status',
      'boutique_items',
      'profile',
      'alterations',
      'tailorings',
      'fcm_token',
      'rents',
      'updatedAt',
      'createdAt',
    ],
  },
  hooks: {
    beforeChange: [trackImageUrlsBeforeChange],
    afterChange: [autoExtractImagesHook],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  timestamps: true,
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      admin: {
        hidden: true,
      },
      access: {
        read: () => true,
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'text',
    },
    {
      name: 'phone_number',
      type: 'text',
    },
    {
      name: 'boutique_items',
      type: 'json',
      admin: {
        components: {
          Cell: {
            path: 'src/components/PrettifyJSON#default'
,
            exportName: 'default',
          },
        },
      },
    },
    {
      name: 'profile',
      type: 'json',
      admin: {
        components: {
          Cell: {
            path: 'src/components/PrettifyJSON#default',
            exportName: 'default',
          },
        },
      },
    },
    {
      name: 'alterations',
      type: 'json',
      admin: {
        components: {
          Cell: {
            path: 'src/components/PrettifyJSON#default',
            exportName: 'default',
          },
        },
      },
    },
    {
      name: 'tailorings',
      type: 'json',
      admin: {
        components: {
          Cell: {
            path: 'src/components/PrettifyJSON#default',
            exportName: 'default',
          },
        },
      },
    },
    {
      name: 'fcm_token',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'text',
      admin: {
        position: 'sidebar',
        components: {
          Cell: {
            path: 'src/components/StatusToggle#default',
            exportName: 'default',
          },
        },
      },
    },
    {
      name: 'rents',
      type: 'json',
      admin: {
        components: {
          Cell: {
            path: 'src/components/PrettifyJSON#default',
            exportName: 'default',
          },
        },
      },
    },
    {
      name: 'extractedImages',
      type: 'relationship',
      relationTo: 'images',
      hasMany: true,
      admin: {
        description: 'Images automatically extracted from JSON fields',
        position: 'sidebar',
      },
    },
  ],
};

export default Tailors;
