// src/collections/profiles.ts
import { CollectionConfig } from 'payload'

export const Profiles: CollectionConfig = {
  slug: 'profiles',
  fields: [
    {
      name: 'created_at',
      type: 'date',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'bio',
      type: 'json',
    },
    {
      name: 'address',
      type: 'json',
    },
    {
      name: 'orders',
      type: 'json',
    },
  ],
  timestamps: false,
}

export default Profiles
