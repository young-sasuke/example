// src/collections/delivery_assignments.ts

import { CollectionConfig } from 'payload'

export const DeliveryAssignments: CollectionConfig = {
  slug: 'delivery_assignments',
  fields: [
    {
      name: 'order_id',
      type: 'text', // UUID ref to orders
    },
    {
      name: 'delivery_person_id',
      type: 'text', // UUID ref to delivery_personnel
    },
    {
      name: 'assigned_at',
      type: 'date',
    },
    {
      name: 'accepted',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  timestamps: false,
}

export default DeliveryAssignments
