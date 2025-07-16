// src/collections/design_parts.ts

import { CollectionConfig } from 'payload'

export const DesignParts: CollectionConfig = {
  slug: 'design_parts',
  fields: [
    {
      name: 'category',
      type: 'text',
      required: true,
    },
    {
      name: 'item_type',
      type: 'text',
      required: true,
    },
    {
      name: 'part_type',
      type: 'text',
      required: true,
    },
    {
      name: 'option_name',
      type: 'text',
      required: true,
    },
    {
      name: 'image_url',
      type: 'text',
    },
    {
      name: 'created_at',
      type: 'date',
    },
  ],
  timestamps: false,
}

export default DesignParts
