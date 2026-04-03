/**
 * Empty State Component Definition
 *
 * Placeholder for empty content areas.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const EMPTY_STATE_COMPONENT: ComponentDefinition = {
  id: 'empty-state',
  name: 'Empty State',
  category: 'data-display',
  description: 'Placeholder for empty content areas',
  icon: 'inbox',

  allowedIn: ['frontend', 'admin', 'vendor'],

  requiredFields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },
  ],

  optionalFields: [
    {
      name: 'description',
      type: 'text',
      label: 'Description',
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Icon Name',
    },
    {
      name: 'image',
      type: 'image',
      label: 'Image',
    },
    {
      name: 'actionText',
      type: 'text',
      label: 'Action Button Text',
    },
    {
      name: 'actionLink',
      type: 'text',
      label: 'Action Link',
    },
  ],

  fieldSynonyms: {
    title: ['heading', 'message'],
    description: ['subtitle', 'text', 'content'],
    actionText: ['buttonText', 'ctaText'],
  },

  apiEndpoints: [],

  events: [
    { name: 'onActionClick', description: 'Triggered when action button is clicked' },
  ],

  templatePath: 'templates/components/data-display/empty-state',
};
