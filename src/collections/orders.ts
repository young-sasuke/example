// src/collections/orders.ts
import { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  fields: [
    {
      name: 'user_id',
      type: 'text',
      required: true,
    },
    {
      name: 'tailor_id',
      type: 'text',
    },
    {
      name: 'tailor_name',
      type: 'text',
      required: true,
    },
    {
      name: 'items',
      type: 'json',
      required: true,
    },
    {
      name: 'created_at',
      type: 'date',
    },
    {
      name: 'total_price',
      type: 'number',
      required: true,
    },
    {
      name: 'status',
      type: 'text',
    },
  ],
  timestamps: false,
}

export default Orders
