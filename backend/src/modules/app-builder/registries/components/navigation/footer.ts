/**
 * Footer Component Definition
 *
 * Site footer with links, social, and copyright.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const FOOTER_COMPONENT: ComponentDefinition = {
  id: 'footer',
  name: 'Footer',
  category: 'navigation',
  description: 'Site footer with links and info',
  icon: 'layout',

  allowedIn: ['frontend'],

  requiredFields: [
    {
      name: 'copyright',
      type: 'text',
      label: 'Copyright Text',
    },
  ],

  optionalFields: [
    {
      name: 'logo',
      type: 'image',
      label: 'Logo',
    },
    {
      name: 'description',
      type: 'text',
      label: 'Description',
    },
    {
      name: 'linkGroups',
      type: 'json',
      label: 'Link Groups',
      default: [],
    },
    {
      name: 'socialLinks',
      type: 'json',
      label: 'Social Links',
      default: [],
    },
    {
      name: 'newsletter',
      type: 'boolean',
      label: 'Show Newsletter',
      default: false,
    },
    {
      name: 'showPaymentIcons',
      type: 'boolean',
      label: 'Show Payment Icons',
      default: false,
    },
  ],

  fieldSynonyms: {
    linkGroups: ['links', 'footerLinks', 'navigation'],
    socialLinks: ['social', 'socials'],
  },

  apiEndpoints: [
    {
      method: 'POST',
      path: '/newsletter/subscribe',
      purpose: 'create',
      requestFields: ['email'],
      responseFields: ['success'],
      conditional: 'newsletter',
    },
  ],

  events: [
    { name: 'onNewsletterSubmit', description: 'Triggered when newsletter form is submitted' },
  ],

  templatePath: 'templates/components/navigation/footer',
};
