import { CollectionConfig } from 'payload'
export const AlterationItems: CollectionConfig = {
  slug: 'alteration_items',
  fields: [
    {
      name: 'item_name',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'text',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
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

export default AlterationItems
