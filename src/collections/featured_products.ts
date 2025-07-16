// src/collections/featured_products.ts

import { CollectionConfig } from 'payload'

export const FeaturedProducts: CollectionConfig = {
  slug: 'featured_products',
  admin: {
    useAsTitle: 'name',
  },
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
      name: 'price',
      type: 'text', // originally character varying(50)
      required: true,
    },
    {
      name: 'image_url',
      type: 'text',
    },
    {
      name: 'category',
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

export default FeaturedProducts
