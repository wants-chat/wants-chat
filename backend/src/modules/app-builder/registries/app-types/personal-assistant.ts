/**
 * Personal Assistant App Type Definition
 *
 * Complete definition for personal assistant services.
 * Essential for virtual assistants, executive assistants, and admin support.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PERSONAL_ASSISTANT_APP_TYPE: AppTypeDefinition = {
  id: 'personal-assistant',
  name: 'Personal Assistant',
  category: 'personal-services',
  description: 'Personal assistant platform with task management, calendar coordination, communication handling, and travel booking',
  icon: 'user-check',

  keywords: [
    'personal assistant',
    'virtual assistant',
    'personal assistant software',
    'executive assistant',
    'admin support',
    'personal assistant management',
    'task management',
    'personal assistant practice',
    'personal assistant scheduling',
    'calendar coordination',
    'personal assistant crm',
    'remote assistant',
    'personal assistant business',
    'travel booking',
    'personal assistant pos',
    'inbox management',
    'personal assistant operations',
    'appointment setting',
    'personal assistant platform',
    'concierge support',
  ],

  synonyms: [
    'personal assistant platform',
    'personal assistant software',
    'virtual assistant software',
    'executive assistant software',
    'admin support software',
    'task management software',
    'personal assistant practice software',
    'calendar coordination software',
    'remote assistant software',
    'concierge support software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tasks and requests' },
    { id: 'admin', name: 'Assistant Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and tasks' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'lead', name: 'Lead Assistant', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'assistant', name: 'Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'tasks',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'documents',
    'appointments',
    'time-tracking',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'car-inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'professional-services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a personal assistant platform',
    'Create a virtual assistant service portal',
    'I need an executive assistant management system',
    'Build a task and calendar coordination platform',
    'Create a client request handling app',
  ],
};
