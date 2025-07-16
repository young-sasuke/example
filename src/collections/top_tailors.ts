// src/collections/top_tailors.ts
import { CollectionConfig } from 'payload'

export const TopTailors: CollectionConfig = {
  slug: 'top_tailors',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'image_url',
      type: 'text',
    },
    {
      name: 'rating',
      type: 'number',
      defaultValue: 0.0,
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'specialization',
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

export default TopTailors
