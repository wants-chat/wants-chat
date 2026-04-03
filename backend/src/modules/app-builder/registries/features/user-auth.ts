/**
 * User Authentication Feature Definition
 *
 * Core authentication feature required by most app types.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const USER_AUTH_FEATURE: FeatureDefinition = {
  id: 'user-auth',
  name: 'User Authentication',
  category: 'security',
  description: 'User registration, login, and session management',
  icon: 'lock',

  includedInAppTypes: [
    'ecommerce', 'marketplace', 'booking', 'crm', 'saas',
    'social-network', 'healthcare', 'education',
  ],

  activationKeywords: [
    'login', 'register', 'signup', 'sign up', 'authentication',
    'user', 'account', 'password', 'auth',
  ],

  enabledByDefault: true,
  optional: false,

  dependencies: [],
  conflicts: [],

  pages: [
    {
      id: 'login',
      route: '/login',
      section: 'frontend',
      title: 'Login',
      authRequired: false,
      templateId: 'auth-page',
      components: ['login-form'],
      layout: 'centered',
    },
    {
      id: 'register',
      route: '/register',
      section: 'frontend',
      title: 'Register',
      authRequired: false,
      templateId: 'auth-page',
      components: ['register-form'],
      layout: 'centered',
    },
    {
      id: 'forgot-password',
      route: '/forgot-password',
      section: 'frontend',
      title: 'Forgot Password',
      authRequired: false,
      templateId: 'auth-page',
      components: ['forgot-password-form'],
      layout: 'centered',
    },
    {
      id: 'reset-password',
      route: '/reset-password',
      section: 'frontend',
      title: 'Reset Password',
      authRequired: false,
      templateId: 'auth-page',
      components: ['reset-password-form'],
      layout: 'centered',
    },
    {
      id: 'profile',
      route: '/profile',
      section: 'frontend',
      title: 'Profile',
      authRequired: true,
      templateId: 'profile-page',
      components: ['profile-header', 'profile-form'],
      layout: 'default',
    },
  ],

  components: [
    'login-form',
    'register-form',
    'forgot-password-form',
    'reset-password-form',
    'profile-header',
    'profile-form',
    'auth-guard',
    'user-menu',
  ],

  entities: [
    {
      name: 'users',
      displayName: 'Users',
      description: 'User accounts',
      isCore: true,
    },
    {
      name: 'sessions',
      displayName: 'Sessions',
      description: 'User sessions',
      isCore: true,
    },
  ],

  apiRoutes: [
    {
      method: 'POST',
      path: '/auth/register',
      auth: false,
      handler: 'custom',
      entity: 'users',
      description: 'Register new user',
    },
    {
      method: 'POST',
      path: '/auth/login',
      auth: false,
      handler: 'custom',
      entity: 'users',
      description: 'Login user',
    },
    {
      method: 'POST',
      path: '/auth/logout',
      auth: true,
      handler: 'custom',
      entity: 'sessions',
      description: 'Logout user',
    },
    {
      method: 'GET',
      path: '/auth/me',
      auth: true,
      handler: 'custom',
      entity: 'users',
      description: 'Get current user',
    },
    {
      method: 'PUT',
      path: '/auth/me',
      auth: true,
      handler: 'custom',
      entity: 'users',
      description: 'Update current user',
    },
    {
      method: 'POST',
      path: '/auth/forgot-password',
      auth: false,
      handler: 'custom',
      entity: 'users',
      description: 'Request password reset',
    },
    {
      method: 'POST',
      path: '/auth/reset-password',
      auth: false,
      handler: 'custom',
      entity: 'users',
      description: 'Reset password',
    },
  ],

  config: [
    {
      key: 'enableSocialLogin',
      label: 'Enable Social Login',
      type: 'boolean',
      default: false,
      description: 'Allow login with Google, GitHub, etc.',
    },
    {
      key: 'requireEmailVerification',
      label: 'Require Email Verification',
      type: 'boolean',
      default: true,
      description: 'Users must verify email before login',
    },
    {
      key: 'sessionDuration',
      label: 'Session Duration (days)',
      type: 'number',
      default: 7,
      description: 'How long sessions remain valid',
    },
  ],
};
