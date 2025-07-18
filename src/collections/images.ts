import { CollectionConfig } from 'payload'

export const Images: CollectionConfig = {
  slug: 'images',
  admin: {
    useAsTitle: 'alt',
    group: 'Image Manager', // 👈 This creates the sidebar dropdown
  },
  upload: {
    staticDir: 'images', // 👈 Folder where images will be stored
    mimeTypes: ['image/*'], // Only allow image uploads
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        crop: 'center',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'tailorName',
      type: 'text',
    },
  ],
}
