/**
 * Swimming Pool App Type Definition
 *
 * Complete definition for swimming pools and aquatic centers.
 * Essential for swim clubs, aquatic facilities, and community pools.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SWIMMING_POOL_APP_TYPE: AppTypeDefinition = {
  id: 'swimming-pool',
  name: 'Swimming Pool',
  category: 'sports',
  description: 'Swimming pool platform with lane booking, swim lessons, lap tracking, and membership management',
  icon: 'waves',

  keywords: [
    'swimming pool',
    'aquatic center',
    'swimming pool software',
    'swim club',
    'pool facility',
    'swimming pool management',
    'lane booking',
    'swimming pool practice',
    'swimming pool scheduling',
    'swim lessons',
    'swimming pool crm',
    'lap swimming',
    'swimming pool business',
    'water aerobics',
    'swimming pool pos',
    'lifeguard',
    'swimming pool operations',
    'swim team',
    'swimming pool services',
    'aquatic sports',
  ],

  synonyms: [
    'swimming pool platform',
    'swimming pool software',
    'aquatic center software',
    'swim club software',
    'pool facility software',
    'lane booking software',
    'swimming pool practice software',
    'swim lessons software',
    'lap swimming software',
    'aquatic sports software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Swimmer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Bookings and lessons' },
    { id: 'admin', name: 'Pool Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Schedules and members' },
  ],

  roles: [
    { id: 'admin', name: 'Facility Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Head Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/lessons' },
    { id: 'lifeguard', name: 'Lifeguard', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'member', name: 'Swimmer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'subscriptions',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'sports',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'aquatic',

  examplePrompts: [
    'Build a swimming pool platform',
    'Create an aquatic center portal',
    'I need a swim club management system',
    'Build a pool facility platform',
    'Create a lane booking and lessons app',
  ],
};
