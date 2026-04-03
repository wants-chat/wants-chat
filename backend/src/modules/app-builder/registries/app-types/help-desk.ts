/**
 * Help Desk & Ticketing App Type Definition
 *
 * Complete definition for help desk and customer support applications.
 * Essential for customer support teams and IT departments.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HELP_DESK_APP_TYPE: AppTypeDefinition = {
  id: 'help-desk',
  name: 'Help Desk & Ticketing',
  category: 'business',
  description: 'Customer support ticketing with knowledge base, live chat, and SLA management',
  icon: 'headset',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'help desk',
    'helpdesk',
    'ticketing',
    'ticket system',
    'support desk',
    'customer support',
    'customer service',
    'support ticket',
    'it support',
    'it helpdesk',
    'service desk',
    'issue tracking',
    'bug tracking',
    'zendesk',
    'freshdesk',
    'intercom',
    'helpscout',
    'jira service',
    'kayako',
    'zoho desk',
    'knowledge base',
    'faq',
    'live chat',
    'support chat',
    'sla',
    'escalation',
    'customer portal',
    'support portal',
  ],

  synonyms: [
    'support software',
    'ticket management',
    'support platform',
    'customer service platform',
    'service management',
    'support system',
    'issue tracker',
    'ticket tracker',
    'support tracker',
    'help center',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'ecommerce',
    'restaurant',
    'fitness',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Customer Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Customer-facing portal for submitting and tracking tickets',
    },
    {
      id: 'admin',
      name: 'Agent Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'agent',
      layout: 'admin',
      description: 'Support agent dashboard for ticket management',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'supervisor',
      name: 'Supervisor',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/tickets',
    },
    {
      id: 'agent',
      name: 'Support Agent',
      level: 40,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/my-tickets',
    },
    {
      id: 'customer',
      name: 'Customer',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/tickets',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'reporting',
    'analytics',
    'time-tracking',
    'email',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'course-management',
    'inventory',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'business',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a help desk system',
    'Create a customer support ticketing app',
    'I need a support portal for my customers',
    'Build a ticketing system like Zendesk',
    'Create an IT helpdesk for my company',
    'I want to build a customer service platform',
    'Make a support desk with knowledge base',
  ],
};
