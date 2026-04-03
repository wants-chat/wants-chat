/**
 * Navbar Component Definition
 *
 * Main navigation header with logo, links, and user menu.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const NAVBAR_COMPONENT: ComponentDefinition = {
  id: 'navbar',
  name: 'Navigation Bar',
  category: 'navigation',
  description: 'Main header navigation with logo and links',
  icon: 'menu',

  allowedIn: ['frontend', 'admin', 'vendor'],

  requiredFields: [
    {
      name: 'logo',
      type: 'image',
      label: 'Logo',
    },
    {
      name: 'links',
      type: 'json',
      label: 'Navigation Links',
      default: [],
    },
  ],

  optionalFields: [
    {
      name: 'showSearch',
      type: 'boolean',
      label: 'Show Search',
      default: true,
    },
    {
      name: 'showCart',
      type: 'boolean',
      label: 'Show Cart',
      default: false,
    },
    {
      name: 'showUserMenu',
      type: 'boolean',
      label: 'Show User Menu',
      default: true,
    },
    {
      name: 'sticky',
      type: 'boolean',
      label: 'Sticky Header',
      default: true,
    },
    {
      name: 'transparent',
      type: 'boolean',
      label: 'Transparent Background',
      default: false,
    },
  ],

  fieldSynonyms: {
    links: ['navItems', 'menuItems', 'navigation'],
    logo: ['brand', 'brandLogo', 'siteLogo'],
  },

  apiEndpoints: [],

  events: [
    { name: 'onSearch', description: 'Triggered when search is submitted' },
    { name: 'onMenuToggle', description: 'Triggered when mobile menu is toggled' },
  ],

  templatePath: 'templates/components/navigation/navbar',
};
