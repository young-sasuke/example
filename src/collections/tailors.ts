// src/collections/tailors.ts
import type { CollectionConfig } from 'payload';
import StatusToggle from '../components/StatusToggle';
import PrettifyJSON from '../components/PrettifyJSON';
import { autoExtractImagesHook, trackImageUrlsBeforeChange } from '../hooks/autoExtractImages';

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
          Cell: PrettifyJSON,
        },
      },
    },
    {
      name: 'profile',
      type: 'json',
      admin: {
        components: {
          Cell: PrettifyJSON,
        },
      },
    },
    {
      name: 'alterations',
      type: 'json',
      admin: {
        components: {
          Cell: PrettifyJSON,
        },
      },
    },
    {
      name: 'tailorings',
      type: 'json',
      admin: {
        components: {
          Cell: PrettifyJSON,
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
          Cell: StatusToggle,
        },
      },
    },
    {
      name: 'rents',
      type: 'json',
      admin: {
        components: {
          Cell: PrettifyJSON,
        },
      },
    },
    // New field to track extracted images
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