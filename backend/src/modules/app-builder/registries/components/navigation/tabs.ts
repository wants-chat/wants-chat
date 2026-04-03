/**
 * Tabs Component Definition
 *
 * Horizontal tab navigation for content sections.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const TABS_COMPONENT: ComponentDefinition = {
  id: 'tabs',
  name: 'Tabs',
  category: 'navigation',
  description: 'Horizontal tab navigation',
  icon: 'folder',

  allowedIn: ['frontend', 'admin', 'vendor'],

  requiredFields: [
    {
      name: 'tabs',
      type: 'json',
      label: 'Tab Items',
      default: [],
    },
  ],

  optionalFields: [
    {
      name: 'defaultTab',
      type: 'text',
      label: 'Default Tab',
    },
    {
      name: 'variant',
      type: 'enum',
      label: 'Variant',
      options: ['underline', 'pills', 'boxed'],
      default: 'underline',
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      label: 'Full Width',
      default: false,
    },
    {
      name: 'vertical',
      type: 'boolean',
      label: 'Vertical Layout',
      default: false,
    },
  ],

  fieldSynonyms: {
    tabs: ['items', 'panels', 'sections'],
  },

  apiEndpoints: [],

  events: [
    { name: 'onChange', description: 'Triggered when tab changes' },
  ],

  templatePath: 'templates/components/navigation/tabs',
};
