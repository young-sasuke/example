// src/collections/tailors.ts
import { CollectionConfig } from 'payload'

export const Tailors: CollectionConfig = {
  slug: 'tailors',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'boutique_items',
      type: 'json',
    },
    {
      name: 'profile',
      type: 'json',
    },
    {
      name: 'alterations',
      type: 'json',
    },
    {
      name: 'tailorings',
      type: 'json',
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
      name: 'status',
      type: 'text',
    },
    {
      name: 'fcm_token',
      type: 'text',
    },
    {
      name: 'rents',
      type: 'json',
    },
  ],
  timestamps: false,
}

export default Tailors
