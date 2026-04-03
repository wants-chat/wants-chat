/**
 * Modal Component Definition
 *
 * Dialog/modal overlay component.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const MODAL_COMPONENT: ComponentDefinition = {
  id: 'modal',
  name: 'Modal',
  category: 'data-display',
  description: 'Dialog/modal overlay component',
  icon: 'maximize-2',

  allowedIn: ['frontend', 'admin', 'vendor'],

  requiredFields: [
    {
      name: 'isOpen',
      type: 'boolean',
      label: 'Is Open',
      default: false,
    },
  ],

  optionalFields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },
    {
      name: 'size',
      type: 'enum',
      label: 'Size',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      default: 'md',
    },
    {
      name: 'showClose',
      type: 'boolean',
      label: 'Show Close Button',
      default: true,
    },
    {
      name: 'closeOnOverlay',
      type: 'boolean',
      label: 'Close on Overlay Click',
      default: true,
    },
    {
      name: 'closeOnEsc',
      type: 'boolean',
      label: 'Close on Escape',
      default: true,
    },
    {
      name: 'showFooter',
      type: 'boolean',
      label: 'Show Footer',
      default: false,
    },
    {
      name: 'confirmText',
      type: 'text',
      label: 'Confirm Button Text',
      default: 'Confirm',
    },
    {
      name: 'cancelText',
      type: 'text',
      label: 'Cancel Button Text',
      default: 'Cancel',
    },
  ],

  fieldSynonyms: {
    isOpen: ['open', 'visible', 'show'],
    title: ['heading', 'header'],
  },

  apiEndpoints: [],

  events: [
    { name: 'onClose', description: 'Triggered when modal is closed' },
    { name: 'onConfirm', description: 'Triggered when confirm is clicked' },
    { name: 'onCancel', description: 'Triggered when cancel is clicked' },
  ],

  templatePath: 'templates/components/data-display/modal',
};
