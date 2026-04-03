/**
 * Emergency Services App Type Definition
 *
 * Complete definition for emergency services and public safety applications.
 * Essential for fire departments, emergency management, and public safety.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EMERGENCY_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'emergency-services',
  name: 'Emergency Services',
  category: 'government',
  description: 'Emergency services platform with incident management, resource tracking, alerts, and community preparedness',
  icon: 'siren',

  keywords: [
    'emergency services',
    'emergency management',
    'fire department',
    'public safety',
    'emergency alerts',
    'disaster preparedness',
    'emergency response',
    'incident management',
    'emergency operations',
    'first responders',
    'emergency software',
    'ems',
    'emergency notifications',
    'hazard alerts',
    'evacuation',
    'emergency planning',
    'mutual aid',
    'emergency resources',
    'community safety',
    'emergency portal',
  ],

  synonyms: [
    'emergency services platform',
    'emergency management software',
    'public safety software',
    'incident management software',
    'emergency response software',
    'fire department software',
    'emergency operations software',
    'disaster management software',
    'emergency alert software',
    'emergency preparedness software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'emergency fund'],

  sections: [
    { id: 'frontend', name: 'Public Portal', enabled: true, basePath: '/', layout: 'public', description: 'Alerts and preparedness' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'responder', layout: 'admin', description: 'Incidents and resources' },
  ],

  roles: [
    { id: 'admin', name: 'Emergency Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Chief', level: 85, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/incidents' },
    { id: 'coordinator', name: 'Emergency Coordinator', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/resources' },
    { id: 'responder', name: 'First Responder', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/dispatch' },
    { id: 'volunteer', name: 'Volunteer', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/assignments' },
    { id: 'public', name: 'Public', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'ecommerce'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'government',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an emergency management platform',
    'Create a public safety app',
    'I need an emergency alert system',
    'Build an incident management system',
    'Create a disaster preparedness portal',
  ],
};
