/**
 * Login Form Component Definition
 *
 * Standard email/password login form with validation.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const LOGIN_FORM_COMPONENT: ComponentDefinition = {
  id: 'login-form',
  name: 'Login Form',
  category: 'form',
  description: 'Email and password login form with validation',
  icon: 'log-in',

  allowedIn: ['frontend'],

  requiredFields: [
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
      placeholder: 'Enter your password',
      validation: { required: true, minLength: 6 },
    },
  ],

  optionalFields: [
    {
      name: 'rememberMe',
      type: 'boolean',
      label: 'Remember me',
      default: false,
    },
  ],

  fieldSynonyms: {
    email: ['username', 'user_email', 'emailAddress'],
    password: ['pass', 'pwd', 'secret'],
  },

  apiEndpoints: [
    {
      method: 'POST',
      path: '/auth/login',
      purpose: 'authenticate',
      requestFields: ['email', 'password'],
      responseFields: ['token', 'user'],
    },
  ],

  events: [
    { name: 'onSubmit', description: 'Triggered when form is submitted' },
    { name: 'onSuccess', description: 'Triggered on successful login' },
    { name: 'onError', description: 'Triggered on login failure' },
  ],

  templatePath: 'templates/components/forms/login-form',
};
