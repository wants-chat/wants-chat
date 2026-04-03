/**
 * Stats Card Component Definition
 *
 * Dashboard statistics display card.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const STATS_CARD_COMPONENT: ComponentDefinition = {
  id: 'stats-card',
  name: 'Stats Card',
  category: 'data-display',
  description: 'Dashboard statistics display',
  icon: 'trending-up',

  allowedIn: ['admin', 'vendor', 'frontend'],

  requiredFields: [
    {
      name: 'label',
      type: 'text',
      label: 'Label',
    },
    {
      name: 'value',
      type: 'text',
      label: 'Value',
    },
  ],

  optionalFields: [
    {
      name: 'icon',
      type: 'text',
      label: 'Icon Name',
    },
    {
      name: 'change',
      type: 'number',
      label: 'Change Percentage',
    },
    {
      name: 'changeLabel',
      type: 'text',
      label: 'Change Label',
      default: 'vs last period',
    },
    {
      name: 'trend',
      type: 'enum',
      label: 'Trend',
      options: ['up', 'down', 'neutral'],
    },
    {
      name: 'color',
      type: 'enum',
      label: 'Color',
      options: ['default', 'primary', 'success', 'warning', 'danger'],
      default: 'default',
    },
    {
      name: 'loading',
      type: 'boolean',
      label: 'Loading State',
      default: false,
    },
  ],

  fieldSynonyms: {
    label: ['title', 'name', 'metric'],
    value: ['count', 'total', 'amount', 'number'],
    change: ['delta', 'difference', 'percent'],
    trend: ['direction', 'movement'],
  },

  apiEndpoints: [
    {
      method: 'GET',
      path: '/stats/:metric',
      purpose: 'read',
      responseFields: ['value', 'change', 'trend'],
    },
  ],

  events: [
    { name: 'onClick', description: 'Triggered when card is clicked' },
  ],

  templatePath: 'templates/components/data-display/stats-card',
};
