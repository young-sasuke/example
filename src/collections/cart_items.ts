// src/collections/cart_items.ts

import { CollectionConfig } from 'payload'

export const CartItems: CollectionConfig = {
  slug: 'cart_items',
  fields: [
    {
      name: 'user_id',
      type: 'text', // uuid reference to auth.users
      required: true,
    },
    {
      name: 'item_type',
      type: 'text',
    },
    {
      name: 'category',
      type: 'text',
    },
    {
      name: 'tailor_name',
      type: 'text',
    },
    {
      name: 'price',
      type: 'number',
    },
    {
      name: 'quantity',
      type: 'number',
    },
    {
      name: 'order_type',
      type: 'text',
    },
    {
      name: 'design_json',
      type: 'json',
    },
    {
      name: 'measurement_json',
      type: 'json',
    },
    {
      name: 'tailor_image',
      type: 'text',
    },
    {
      name: 'inserted_at',
      type: 'date',
    },
  ],
  timestamps: false,
}

export default CartItems
