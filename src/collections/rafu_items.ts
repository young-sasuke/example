// src/collections/rafu_items.ts
import { CollectionConfig } from 'payload'

export const RafuItems: CollectionConfig = {
  slug: 'rafu_items',
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

export default RafuItems
