// src/collections/User.ts
import { CollectionConfig } from 'payload'

export const User: CollectionConfig = {
  slug: 'User',
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'email',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'role',
      type: 'text',
      defaultValue: 'user',
    },
    {
      name: 'created_at',
      type: 'date',
    },
    {
      name: 'design',
      type: 'json',
    },
    {
      name: 'measurement',
      type: 'json',
    },
    {
      name: 'profile',
      type: 'json',
    },
    {
      name: 'address',
      type: 'json',
    },
    {
      name: 'password',
      type: 'text',
    },
    {
      name: 'profile_image_url',
      type: 'text',
    },
    {
      name: 'phone_number',
      type: 'text',
    },
    {
      name: 'requirement_images',
      type: 'text',
    },
    {
      name: 'sample_images',
      type: 'text',
    },
    {
      name: 'measurement_samples',
      type: 'json',
    },
    {
      name: 'fcm_token',
      type: 'text',
    },
    {
      name: 'fabric_samples_image',
      type: 'json',
    }
  ],
  timestamps: false,
}

export default User
