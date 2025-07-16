// src/collections/fall_items.ts

import { CollectionConfig } from 'payload'

export const FallItems: CollectionConfig = {
  slug: 'fall_items',
  fields: [
    {
      name: 'item_name',
      type: 'text',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
    },
    {
      name: 'image_url',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'delivery',
      type: 'text',
    },
  ],
  timestamps: false,
}

export default FallItems
