/**
 * Badge Component Definition
 *
 * Status badges and labels.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const BADGE_COMPONENT: ComponentDefinition = {
  id: 'badge',
  name: 'Badge',
  category: 'data-display',
  description: 'Status badges and labels',
  icon: 'tag',

  allowedIn: ['frontend', 'admin', 'vendor'],

  requiredFields: [
    {
      name: 'text',
      type: 'text',
      label: 'Text',
    },
  ],

  optionalFields: [
    {
      name: 'variant',
      type: 'enum',
      label: 'Variant',
      options: ['solid', 'outline', 'subtle'],
      default: 'solid',
    },
    {
      name: 'color',
      type: 'enum',
      label: 'Color',
      options: ['default', 'primary', 'success', 'warning', 'danger', 'info'],
      default: 'default',
    },
    {
      name: 'size',
      type: 'enum',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
    },
    {
      name: 'dot',
      type: 'boolean',
      label: 'Show Dot',
      default: false,
    },
    {
      name: 'removable',
      type: 'boolean',
      label: 'Removable',
      default: false,
    },
  ],

  fieldSynonyms: {
    text: ['label', 'content', 'value'],
    color: ['status', 'type'],
  },

  apiEndpoints: [],

  events: [
    { name: 'onRemove', description: 'Triggered when badge is removed' },
  ],

  templatePath: 'templates/components/data-display/badge',
};
