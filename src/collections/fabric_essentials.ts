// src/collections/fabric_essentials.ts

import { CollectionConfig } from 'payload'

export const FabricEssentials: CollectionConfig = {
  slug: 'fabric_essentials',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'image_url',
      type: 'text',
    },
    {
      name: 'background_color',
      type: 'text',
      defaultValue: '#FFFFF0F0',
    },
    {
      name: 'category',
      type: 'text',
      defaultValue: 'Fabric',
    },
    {
      name: 'item_type',
      type: 'text',
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'created_at',
      type: 'date',
    },
    {
      name: 'updated_at',
      type: 'date',
    },
  ],
  timestamps: false,
}

export default FabricEssentials
