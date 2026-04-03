/**
 * Contact Form Component Definition
 *
 * General-purpose contact/inquiry form.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const CONTACT_FORM_COMPONENT: ComponentDefinition = {
  id: 'contact-form',
  name: 'Contact Form',
  category: 'form',
  description: 'Contact/inquiry form with message',
  icon: 'mail',

  allowedIn: ['frontend'],

  requiredFields: [
    {
      name: 'name',
      type: 'text',
      label: 'Your Name',
      placeholder: 'Enter your name',
      validation: { required: true },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email',
      validation: { required: true, email: true },
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Message',
      placeholder: 'How can we help you?',
      validation: { required: true, minLength: 10 },
    },
  ],

  optionalFields: [
    {
      name: 'subject',
      type: 'text',
      label: 'Subject',
      placeholder: 'What is this about?',
    },
    {
      name: 'phone',
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
    },
    {
      name: 'company',
      type: 'text',
      label: 'Company',
      placeholder: 'Your company name',
    },
  ],

  fieldSynonyms: {
    name: ['fullName', 'senderName', 'contactName'],
    email: ['emailAddress', 'contactEmail'],
    message: ['content', 'body', 'inquiry', 'details'],
    subject: ['topic', 'title', 'reason'],
  },

  apiEndpoints: [
    {
      method: 'POST',
      path: '/contact',
      purpose: 'create',
      requestFields: ['name', 'email', 'subject', 'message', 'phone', 'company'],
      responseFields: ['id', 'status'],
    },
  ],

  events: [
    { name: 'onSubmit', description: 'Triggered when form is submitted' },
    { name: 'onSuccess', description: 'Triggered on successful submission' },
    { name: 'onError', description: 'Triggered on submission failure' },
  ],

  templatePath: 'templates/components/forms/contact-form',
};
