// src/collections/fabric_repair_items.ts

import { CollectionConfig } from 'payload'

export const FabricRepairItems: CollectionConfig = {
  slug: 'fabric_repair_items',
  fields: [
    {
      name: 'item_name',
      type: 'text',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
    },
    {
      name: 'image_url',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'delivery',
      type: 'text',
    },
  ],
  timestamps: false,
}

export default FabricRepairItems
