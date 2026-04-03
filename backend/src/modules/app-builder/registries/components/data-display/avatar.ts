/**
 * Avatar Component Definition
 *
 * User avatar/profile picture display.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const AVATAR_COMPONENT: ComponentDefinition = {
  id: 'avatar',
  name: 'Avatar',
  category: 'data-display',
  description: 'User avatar/profile picture',
  icon: 'user',

  allowedIn: ['frontend', 'admin', 'vendor'],

  requiredFields: [],

  optionalFields: [
    {
      name: 'src',
      type: 'image',
      label: 'Image URL',
    },
    {
      name: 'name',
      type: 'text',
      label: 'Name (for initials)',
    },
    {
      name: 'size',
      type: 'enum',
      label: 'Size',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      default: 'md',
    },
    {
      name: 'shape',
      type: 'enum',
      label: 'Shape',
      options: ['circle', 'square', 'rounded'],
      default: 'circle',
    },
    {
      name: 'status',
      type: 'enum',
      label: 'Status',
      options: ['online', 'offline', 'away', 'busy'],
    },
    {
      name: 'showStatus',
      type: 'boolean',
      label: 'Show Status',
      default: false,
    },
  ],

  fieldSynonyms: {
    src: ['image', 'url', 'photo', 'picture'],
    name: ['displayName', 'username', 'fullName'],
  },

  apiEndpoints: [],

  events: [
    { name: 'onClick', description: 'Triggered when avatar is clicked' },
    { name: 'onError', description: 'Triggered when image fails to load' },
  ],

  templatePath: 'templates/components/data-display/avatar',
};
