import type { CollectionConfig } from 'payload';
import type {
  PayloadComponent,
  DefaultCellComponentProps,
  DefaultServerCellComponentProps,
} from 'payload';
import StatusToggle from '../components/StatusToggle';
import PrettifyJSON from '../components/PrettifyJSON';  


export const Tailors: CollectionConfig = {
  slug: 'tailors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'email',
      'phone_number',
      'status',
      'boutique_items',
      'profile',
      'alterations',
      'tailorings',
      'fcm_token',
      'rents',
      'updatedAt',
      'createdAt',
    ],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  timestamps: true,
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      admin: {
        hidden: true,
      },
      access: {
        read: () => true,
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'text',
    },
    {
      name: 'phone_number',
      type: 'text',
    },
    {
      name: 'boutique_items',
      type: 'json',
      admin: {
        components: {
          // Use PrettifyJSON to display boutique_items prettified
          Cell: PrettifyJSON,
        },
      },
    },
    {
      name: 'profile',
      type: 'json',
      admin: {
        components: {
          // Use PrettifyJSON to display boutique_items prettified
          Cell: PrettifyJSON,
        },
      },
    },
    {
      name: 'alterations',
      type: 'json',
      admin: {
        components: {
          // Use PrettifyJSON to display boutique_items prettified
          Cell: PrettifyJSON,
        },
      },
    },
    {
      name: 'tailorings',
      type: 'json',
      admin: {
        components: {
          // Use PrettifyJSON to display boutique_items prettified
          Cell: PrettifyJSON,
        },
      },
    },
    {
      name: 'fcm_token',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'text',
      admin: {
        position: 'sidebar',
        components: {
          Cell: StatusToggle,
        },
      },
    },
    {
      name: 'rents',
      type: 'json',
    },
  ],
};

export default Tailors;
