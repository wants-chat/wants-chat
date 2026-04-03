/**
 * Register Form Component Definition
 *
 * User registration form with password confirmation.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const REGISTER_FORM_COMPONENT: ComponentDefinition = {
  id: 'register-form',
  name: 'Registration Form',
  category: 'form',
  description: 'User registration form with validation',
  icon: 'user-plus',

  allowedIn: ['frontend'],

  requiredFields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
      placeholder: 'Enter your name',
      validation: { required: true, minLength: 2 },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'Enter your email',
      validation: { required: true, email: true },
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      placeholder: 'Create a password',
      validation: { required: true, minLength: 8 },
    },
    {
      name: 'confirmPassword',
      type: 'password',
      label: 'Confirm Password',
      placeholder: 'Confirm your password',
      validation: { required: true, match: 'password' },
    },
  ],

  optionalFields: [
    {
      name: 'phone',
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
    },
    {
      name: 'acceptTerms',
      type: 'boolean',
      label: 'I accept the Terms of Service',
      validation: { required: true },
    },
  ],

  fieldSynonyms: {
    name: ['fullName', 'full_name', 'displayName', 'username'],
    email: ['emailAddress', 'user_email'],
    phone: ['phoneNumber', 'mobile', 'telephone'],
  },

  apiEndpoints: [
    {
      method: 'POST',
      path: '/auth/register',
      purpose: 'create',
      requestFields: ['name', 'email', 'password', 'phone'],
      responseFields: ['token', 'user'],
    },
  ],

  events: [
    { name: 'onSubmit', description: 'Triggered when form is submitted' },
    { name: 'onSuccess', description: 'Triggered on successful registration' },
    { name: 'onError', description: 'Triggered on registration failure' },
  ],

  templatePath: 'templates/components/forms/register-form',
};
