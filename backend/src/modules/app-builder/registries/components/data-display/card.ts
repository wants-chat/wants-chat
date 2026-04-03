/**
 * Card Component Definition
 *
 * Versatile card container for content display.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const CARD_COMPONENT: ComponentDefinition = {
  id: 'card',
  name: 'Card',
  category: 'data-display',
  description: 'Versatile card container for content',
  icon: 'square',

  allowedIn: ['frontend', 'admin', 'vendor'],

  requiredFields: [],

  optionalFields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },
    {
      name: 'description',
      type: 'text',
      label: 'Description',
    },
    {
      name: 'image',
      type: 'image',
      label: 'Image',
    },
    {
      name: 'footer',
      type: 'text',
      label: 'Footer',
    },
    {
      name: 'actions',
      type: 'json',
      label: 'Actions',
      default: [],
    },
    {
      name: 'hoverable',
      type: 'boolean',
      label: 'Hover Effect',
      default: false,
    },
    {
      name: 'bordered',
      type: 'boolean',
      label: 'Show Border',
      default: true,
    },
    {
      name: 'shadow',
      type: 'enum',
      label: 'Shadow',
      options: ['none', 'sm', 'md', 'lg'],
      default: 'sm',
    },
  ],

  fieldSynonyms: {
    title: ['heading', 'name', 'label'],
    description: ['content', 'body', 'text', 'subtitle'],
    image: ['thumbnail', 'cover', 'photo'],
    actions: ['buttons', 'cta'],
  },

  apiEndpoints: [],

  events: [
    { name: 'onClick', description: 'Triggered when card is clicked' },
    { name: 'onActionClick', description: 'Triggered when action button is clicked' },
  ],

  templatePath: 'templates/components/data-display/card',
};
