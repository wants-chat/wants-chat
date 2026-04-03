/**
 * Parasailing App Type Definition
 *
 * Complete definition for parasailing and water adventure operations.
 * Essential for parasailing operators, water sports centers, and beach excursions.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PARASAILING_APP_TYPE: AppTypeDefinition = {
  id: 'parasailing',
  name: 'Parasailing',
  category: 'entertainment',
  description: 'Parasailing platform with flight booking, weather conditions, boat scheduling, and safety compliance tracking',
  icon: 'wind',

  keywords: [
    'parasailing',
    'water adventure',
    'parasailing software',
    'beach excursion',
    'ocean sports',
    'parasailing management',
    'flight booking',
    'parasailing practice',
    'parasailing scheduling',
    'weather conditions',
    'parasailing crm',
    'boat scheduling',
    'parasailing business',
    'safety compliance',
    'parasailing pos',
    'tandem parasail',
    'parasailing operations',
    'triple rider',
    'parasailing platform',
    'parachute ride',
  ],

  synonyms: [
    'parasailing platform',
    'parasailing software',
    'water adventure software',
    'beach excursion software',
    'ocean sports software',
    'flight booking software',
    'parasailing practice software',
    'weather conditions software',
    'boat scheduling software',
    'tandem parasail software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Flights and booking' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Boats and weather' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'captain', name: 'Boat Captain', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'crew', name: 'Crew Member', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/flights' },
    { id: 'customer', name: 'Rider', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'beach',

  examplePrompts: [
    'Build a parasailing platform',
    'Create a water adventure portal',
    'I need a beach excursion system',
    'Build a parasail booking platform',
    'Create a ocean sports app',
  ],
};
