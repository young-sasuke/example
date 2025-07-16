// src/collections/quickfix_orders.ts
import { CollectionConfig } from 'payload'

export const QuickFixOrders: CollectionConfig = {
  slug: 'quickfix_orders',
  fields: [
    {
      name: 'user_id',
      type: 'text',
      required: true,
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
      name: 'total_price',
      type: 'number',
      required: true,
    },
    {
      name: 'status',
      type: 'text',
      defaultValue: 'Ongoing',
    },
    {
      name: 'created_at',
      type: 'date',
    },
    {
      name: 'order_type',
      type: 'text',
    },
  ],
  timestamps: false,
}

export default QuickFixOrders
