// src/collections/delivery_status_updates.ts

import { CollectionConfig } from 'payload'

export const DeliveryStatusUpdates: CollectionConfig = {
  slug: 'delivery_status_updates',
  fields: [
    {
      name: 'assignment_id',
      type: 'text', // UUID ref to delivery_assignments
    },
    {
      name: 'status',
      type: 'text',
    },
    {
      name: 'timestamp',
      type: 'date',
    },
  ],
  timestamps: false,
}

export default DeliveryStatusUpdates
