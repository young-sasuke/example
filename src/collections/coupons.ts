// src/collections/coupons.ts

import { CollectionConfig } from 'payload'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    useAsTitle: 'code',
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'discount_type',
      type: 'text',
      required: true,
    },
    {
      name: 'discount_value',
      type: 'number',
      required: true,
    },
    {
      name: 'min_order_amount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'max_discount_amount',
      type: 'number',
    },
    {
      name: 'usage_limit',
      type: 'number',
    },
    {
      name: 'used_count',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'valid_from',
      type: 'date',
      required: true,
    },
    {
      name: 'valid_until',
      type: 'date',
      required: true,
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'applicable_categories',
      type: 'array',
      fields: [{ name: 'category', type: 'text' }],
    },
    {
      name: 'exclusive',
      type: 'checkbox',
      defaultValue: false,
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

export default Coupons
