/**
 * Profile Form Component Definition
 *
 * User profile editing form.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const PROFILE_FORM_COMPONENT: ComponentDefinition = {
  id: 'profile-form',
  name: 'Profile Form',
  category: 'form',
  description: 'User profile editing form',
  icon: 'user',

  allowedIn: ['frontend', 'admin'],

  requiredFields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
      placeholder: 'Enter your name',
      validation: { required: true },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'Enter your email',
      validation: { required: true, email: true },
    },
  ],

  optionalFields: [
    {
      name: 'avatar',
      type: 'image',
      label: 'Profile Picture',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Bio',
      placeholder: 'Tell us about yourself',
    },
    {
      name: 'phone',
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
    },
    {
      name: 'location',
      type: 'text',
      label: 'Location',
      placeholder: 'City, Country',
    },
    {
      name: 'website',
      type: 'url',
      label: 'Website',
      placeholder: 'https://yourwebsite.com',
    },
  ],

  fieldSynonyms: {
    name: ['fullName', 'displayName', 'username'],
    avatar: ['profilePicture', 'photo', 'image', 'picture'],
    bio: ['about', 'description', 'summary'],
    location: ['address', 'city', 'place'],
  },

  apiEndpoints: [
    {
      method: 'GET',
      path: '/auth/me',
      purpose: 'read',
      responseFields: ['id', 'name', 'email', 'avatar', 'bio', 'phone', 'location', 'website'],
    },
    {
      method: 'PUT',
      path: '/auth/me',
      purpose: 'update',
      requestFields: ['name', 'avatar', 'bio', 'phone', 'location', 'website'],
      responseFields: ['id', 'name', 'email'],
    },
  ],

  events: [
    { name: 'onSubmit', description: 'Triggered when form is submitted' },
    { name: 'onSuccess', description: 'Triggered on successful update' },
    { name: 'onError', description: 'Triggered on update failure' },
    { name: 'onAvatarChange', description: 'Triggered when avatar is changed' },
  ],

  templatePath: 'templates/components/forms/profile-form',
};
