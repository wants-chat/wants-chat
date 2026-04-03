/**
 * Alarm Monitoring App Type Definition
 *
 * Complete definition for alarm monitoring and central station applications.
 * Essential for alarm companies, monitoring centers, and security integrators.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALARM_MONITORING_APP_TYPE: AppTypeDefinition = {
  id: 'alarm-monitoring',
  name: 'Alarm Monitoring',
  category: 'security',
  description: 'Alarm monitoring platform with event processing, dispatch coordination, subscriber management, and reporting',
  icon: 'bell-alert',

  keywords: [
    'alarm monitoring',
    'central station',
    'alarm software',
    'alarm company',
    'security monitoring',
    'alarm dispatch',
    'alarm events',
    'alarm subscriber',
    'monitoring center',
    'alarm response',
    'burglar alarm',
    'fire alarm monitoring',
    'alarm signals',
    'alarm panel',
    'alarm business',
    'alarm operator',
    'alarm processing',
    'alarm service',
    'security alarm',
    'monitoring service',
  ],

  synonyms: [
    'alarm monitoring platform',
    'alarm monitoring software',
    'central station software',
    'alarm company software',
    'security monitoring software',
    'alarm dispatch software',
    'monitoring center software',
    'alarm processing software',
    'alarm subscriber software',
    'alarm service software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'alarm clock'],

  sections: [
    { id: 'frontend', name: 'Subscriber Portal', enabled: true, basePath: '/', layout: 'public', description: 'Account and history' },
    { id: 'admin', name: 'Monitoring Dashboard', enabled: true, basePath: '/admin', requiredRole: 'operator', layout: 'admin', description: 'Events and dispatch' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Station Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/operations' },
    { id: 'operator', name: 'Monitoring Operator', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/events' },
    { id: 'technician', name: 'Service Technician', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/service' },
    { id: 'subscriber', name: 'Subscriber', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reporting',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'scheduling',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'security',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an alarm monitoring platform',
    'Create a central station software',
    'I need an alarm dispatch system',
    'Build a security monitoring app',
    'Create an alarm subscriber management platform',
  ],
};
