/**
 * Sidebar Component Definition
 *
 * Vertical navigation sidebar for admin/dashboard layouts.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const SIDEBAR_COMPONENT: ComponentDefinition = {
  id: 'sidebar',
  name: 'Sidebar Navigation',
  category: 'navigation',
  description: 'Vertical sidebar navigation for dashboards',
  icon: 'sidebar',

  allowedIn: ['admin', 'vendor'],

  requiredFields: [
    {
      name: 'menuItems',
      type: 'json',
      label: 'Menu Items',
      default: [],
    },
  ],

  optionalFields: [
    {
      name: 'logo',
      type: 'image',
      label: 'Logo',
    },
    {
      name: 'collapsible',
      type: 'boolean',
      label: 'Collapsible',
      default: true,
    },
    {
      name: 'defaultCollapsed',
      type: 'boolean',
      label: 'Start Collapsed',
      default: false,
    },
    {
      name: 'showUserInfo',
      type: 'boolean',
      label: 'Show User Info',
      default: true,
    },
    {
      name: 'theme',
      type: 'enum',
      label: 'Theme',
      options: ['light', 'dark'],
      default: 'dark',
    },
  ],

  fieldSynonyms: {
    menuItems: ['links', 'navItems', 'navigation', 'menu'],
    logo: ['brand', 'brandLogo'],
  },

  apiEndpoints: [],

  events: [
    { name: 'onCollapse', description: 'Triggered when sidebar is collapsed' },
    { name: 'onExpand', description: 'Triggered when sidebar is expanded' },
    { name: 'onItemClick', description: 'Triggered when menu item is clicked' },
  ],

  templatePath: 'templates/components/navigation/sidebar',
};
