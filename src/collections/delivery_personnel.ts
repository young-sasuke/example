// src/collections/delivery_personnel.ts

import { CollectionConfig } from 'payload'

export const DeliveryPersonnel: CollectionConfig = {
  slug: 'delivery_personnel',
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'email',
      type: 'text',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'phone_number',
      type: 'text',
    },
    {
      name: 'created_at',
      type: 'date',
    },
  ],
  timestamps: false,
}

export default DeliveryPersonnel
