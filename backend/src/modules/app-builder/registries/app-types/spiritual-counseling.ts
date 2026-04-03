/**
 * Spiritual Counseling App Type Definition
 *
 * Complete definition for spiritual counseling and pastoral care applications.
 * Essential for spiritual counselors, chaplains, and faith-based counseling services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPIRITUAL_COUNSELING_APP_TYPE: AppTypeDefinition = {
  id: 'spiritual-counseling',
  name: 'Spiritual Counseling',
  category: 'religious',
  description: 'Spiritual counseling platform with session booking, client management, resource sharing, and secure communication',
  icon: 'users',

  keywords: [
    'spiritual counseling',
    'pastoral care',
    'spiritual counselor',
    'counseling software',
    'faith counseling',
    'spiritual guidance',
    'chaplaincy',
    'counseling sessions',
    'spiritual direction',
    'grief counseling',
    'counseling crm',
    'spiritual support',
    'counseling business',
    'soul care',
    'counseling pos',
    'crisis counseling',
    'counseling management',
    'spiritual wellness',
    'counseling services',
    'life coaching spiritual',
  ],

  synonyms: [
    'spiritual counseling platform',
    'spiritual counseling software',
    'pastoral care software',
    'faith counseling software',
    'spiritual direction software',
    'chaplaincy software',
    'spiritual guidance software',
    'counseling session software',
    'spiritual support software',
    'soul care software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'mental health therapy'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and resources' },
    { id: 'admin', name: 'Counselor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'counselor', layout: 'admin', description: 'Clients and sessions' },
  ],

  roles: [
    { id: 'admin', name: 'Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Practice Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'counselor', name: 'Counselor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/clients' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
    'feedback',
    'documents',
    'reporting',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'religious',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'calm',

  examplePrompts: [
    'Build a spiritual counseling booking platform',
    'Create a pastoral care management app',
    'I need a faith-based counseling system',
    'Build a spiritual direction scheduling platform',
    'Create a chaplaincy services app',
  ],
};
