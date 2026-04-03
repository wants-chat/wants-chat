/**
 * Breadcrumbs Component Definition
 *
 * Navigation breadcrumb trail.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const BREADCRUMBS_COMPONENT: ComponentDefinition = {
  id: 'breadcrumbs',
  name: 'Breadcrumbs',
  category: 'navigation',
  description: 'Navigation breadcrumb trail',
  icon: 'chevrons-right',

  allowedIn: ['frontend', 'admin', 'vendor'],

  requiredFields: [
    {
      name: 'items',
      type: 'json',
      label: 'Breadcrumb Items',
      default: [],
    },
  ],

  optionalFields: [
    {
      name: 'separator',
      type: 'text',
      label: 'Separator',
      default: '/',
    },
    {
      name: 'showHome',
      type: 'boolean',
      label: 'Show Home Link',
      default: true,
    },
    {
      name: 'maxItems',
      type: 'number',
      label: 'Max Items',
      default: 5,
    },
  ],

  fieldSynonyms: {
    items: ['trail', 'path', 'crumbs', 'links'],
  },

  apiEndpoints: [],

  events: [
    { name: 'onItemClick', description: 'Triggered when breadcrumb item is clicked' },
  ],

  templatePath: 'templates/components/navigation/breadcrumbs',
};
