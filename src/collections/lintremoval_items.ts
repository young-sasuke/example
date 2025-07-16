// src/collections/lintremoval_items.ts
import { CollectionConfig } from 'payload'

export const LintRemovalItems: CollectionConfig = {
  slug: 'lintremoval_items',
  fields: [
    {
      name: 'item_name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'delivery',
      type: 'text',
    },
    {
      name: 'price',
      type: 'number',
    },
    {
      name: 'created_at',
      type: 'date',
    },
    {
      name: 'updated_at',
      type: 'date',
    },
    {
      name: 'image_url',
      type: 'text',
    },
  ],
  timestamps: false,
}

export default LintRemovalItems
