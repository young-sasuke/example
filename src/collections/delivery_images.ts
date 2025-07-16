// src/collections/delivery_images.ts

import { CollectionConfig } from 'payload'

export const DeliveryImages: CollectionConfig = {
  slug: 'delivery_images',
  fields: [
    {
      name: 'assignment_id',
      type: 'text', // UUID ref to delivery_assignments
    },
    {
      name: 'image_type',
      type: 'text',
    },
    {
      name: 'image_url',
      type: 'text',
    },
    {
      name: 'uploaded_at',
      type: 'date',
    },
  ],
  timestamps: false,
}

export default DeliveryImages
