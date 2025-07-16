// src/collections/dyeing_items.ts

import { CollectionConfig } from 'payload'

export const DyeingItems: CollectionConfig = {
  slug: 'dyeing_items',
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

export default DyeingItems
