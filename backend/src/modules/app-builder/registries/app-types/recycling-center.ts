/**
 * Recycling Center App Type Definition
 *
 * Complete definition for recycling centers and materials recovery.
 * Essential for recycling facilities, MRFs, and scrap processors.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RECYCLING_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'recycling-center',
  name: 'Recycling Center',
  category: 'environmental',
  description: 'Recycling center platform with materials intake, pricing management, weight tracking, and payout processing',
  icon: 'recycle',

  keywords: [
    'recycling center',
    'materials recovery',
    'recycling software',
    'scrap processing',
    'bottle redemption',
    'recycling management',
    'materials intake',
    'recycling practice',
    'recycling scheduling',
    'weight tracking',
    'recycling crm',
    'metal recycling',
    'recycling business',
    'e-waste recycling',
    'recycling pos',
    'can redemption',
    'recycling operations',
    'paper recycling',
    'recycling services',
    'plastics recycling',
  ],

  synonyms: [
    'recycling center platform',
    'recycling software',
    'materials recovery software',
    'scrap processing software',
    'bottle redemption software',
    'materials intake software',
    'recycling practice software',
    'weight tracking software',
    'metal recycling software',
    'e-waste recycling software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Materials and prices' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Intake and payouts' },
  ],

  roles: [
    { id: 'admin', name: 'Center Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'supervisor', name: 'Floor Supervisor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/intake' },
    { id: 'attendant', name: 'Attendant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/scale' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'clients',
    'reporting',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'environmental',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build a recycling center platform',
    'Create a materials recovery portal',
    'I need a scrap yard management system',
    'Build a bottle redemption platform',
    'Create a recycling intake and payout app',
  ],
};
