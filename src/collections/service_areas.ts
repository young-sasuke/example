// src/collections/service_areas.ts
import { CollectionConfig } from 'payload'

export const ServiceAreas: CollectionConfig = {
  slug: 'service_areas',
  fields: [
    {
      name: 'city_name',
      type: 'text',
      required: true,
    },
    {
      name: 'state_name',
      type: 'text',
      required: true,
    },
    {
      name: 'country_name',
      type: 'text',
      defaultValue: 'India',
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
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

export default ServiceAreas
