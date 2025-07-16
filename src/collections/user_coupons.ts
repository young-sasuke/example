// src/collections/user_coupons.ts
import { CollectionConfig } from 'payload'

export const UserCoupons: CollectionConfig = {
  slug: 'user_coupons',
  fields: [
    {
      name: 'user_id',
      type: 'text',
      required: true,
    },
    {
      name: 'coupon_id',
      type: 'text',
      required: true,
    },
    {
      name: 'used_at',
      type: 'date',
    },
    {
      name: 'order_id',
      type: 'text',
    },
    {
      name: 'created_at',
      type: 'date',
    },
  ],
  timestamps: false,
}

export default UserCoupons
