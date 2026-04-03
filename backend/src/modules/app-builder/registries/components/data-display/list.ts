/**
 * List Component Definition
 *
 * Vertical list display for items.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const LIST_COMPONENT: ComponentDefinition = {
  id: 'list',
  name: 'List',
  category: 'data-display',
  description: 'Vertical list display for items',
  icon: 'list',

  allowedIn: ['frontend', 'admin', 'vendor'],

  requiredFields: [
    {
      name: 'items',
      type: 'json',
      label: 'Items',
      default: [],
    },
  ],

  optionalFields: [
    {
      name: 'variant',
      type: 'enum',
      label: 'Variant',
      options: ['simple', 'bordered', 'divided'],
      default: 'simple',
    },
    {
      name: 'size',
      type: 'enum',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
    },
    {
      name: 'clickable',
      type: 'boolean',
      label: 'Clickable Items',
      default: false,
    },
    {
      name: 'loading',
      type: 'boolean',
      label: 'Loading State',
      default: false,
    },
    {
      name: 'emptyMessage',
      type: 'text',
      label: 'Empty Message',
      default: 'No items',
    },
  ],

  fieldSynonyms: {
    items: ['data', 'rows', 'records', 'entries'],
  },

  apiEndpoints: [
    {
      method: 'GET',
      path: '/:entity',
      purpose: 'list',
      responseFields: ['items'],
    },
  ],

  events: [
    { name: 'onItemClick', description: 'Triggered when item is clicked' },
  ],

  templatePath: 'templates/components/data-display/list',
};
