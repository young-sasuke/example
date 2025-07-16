// src/collections/otp_requests.ts
import { CollectionConfig } from 'payload'

export const OtpRequests: CollectionConfig = {
  slug: 'otp_requests',
  fields: [
    {
      name: 'phone_number',
      type: 'text',
      required: true,
    },
    {
      name: 'otp',
      type: 'text',
      required: true,
    },
    {
      name: 'expires_at',
      type: 'date',
      required: true,
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'created_at',
      type: 'date',
    },
  ],
  timestamps: false,
}

export default OtpRequests
