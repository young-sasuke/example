// src/collections/pico_items.ts
import { CollectionConfig } from 'payload'

export const PicoItems: CollectionConfig = {
  slug: 'pico_items',
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
  ],
  timestamps: false,
}

export default PicoItems
