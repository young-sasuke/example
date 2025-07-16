// src/collections/admins.ts

import { CollectionConfig } from 'payload'

export const Admins: CollectionConfig = {
  slug: 'admins',
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'email',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'role',
      type: 'text',
      required: true,
    },
    {
      name: 'lastlogin',
      type: 'number', // bigint in Supabase
    },
    {
      name: 'password',
      type: 'text',
    },
  ],
  timestamps: false,
}

export default Admins
