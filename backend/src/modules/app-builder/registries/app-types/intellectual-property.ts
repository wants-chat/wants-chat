/**
 * Intellectual Property App Type Definition
 *
 * Complete definition for IP and patent attorneys.
 * Essential for patent prosecution, trademark registration, and IP litigation.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INTELLECTUAL_PROPERTY_APP_TYPE: AppTypeDefinition = {
  id: 'intellectual-property',
  name: 'Intellectual Property',
  category: 'legal',
  description: 'IP law platform with patent docketing, trademark monitoring, deadline tracking, and portfolio management',
  icon: 'lightbulb',

  keywords: [
    'intellectual property',
    'IP attorney',
    'IP software',
    'patent lawyer',
    'trademark',
    'IP management',
    'patent prosecution',
    'IP firm',
    'IP scheduling',
    'copyright',
    'IP crm',
    'trade secret',
    'IP business',
    'USPTO',
    'IP pos',
    'infringement',
    'IP operations',
    'licensing',
    'IP services',
    'patent portfolio',
  ],

  synonyms: [
    'intellectual property platform',
    'intellectual property software',
    'IP attorney software',
    'patent lawyer software',
    'trademark software',
    'patent prosecution software',
    'IP firm software',
    'copyright software',
    'USPTO software',
    'patent portfolio software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general litigation'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Patents and trademarks' },
    { id: 'admin', name: 'Firm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'paralegal', layout: 'admin', description: 'Docketing and deadlines' },
  ],

  roles: [
    { id: 'admin', name: 'Managing Partner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'attorney', name: 'IP Attorney', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patents' },
    { id: 'paralegal', name: 'IP Paralegal', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/docket' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'case-management',
    'client-intake',
    'document-assembly',
    'billing-timekeeping',
    'matter-notes',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'court-calendar',
    'conflict-check',
    'client-portal',
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'legal',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an IP law firm platform',
    'Create a patent docketing app',
    'I need a trademark monitoring system',
    'Build an intellectual property portfolio platform',
    'Create a USPTO filing management app',
  ],
};
