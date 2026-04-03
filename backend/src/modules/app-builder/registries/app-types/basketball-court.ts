/**
 * Basketball Court App Type Definition
 *
 * Complete definition for basketball courts and indoor sports facilities.
 * Essential for basketball gyms, indoor courts, and recreational sports centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BASKETBALL_COURT_APP_TYPE: AppTypeDefinition = {
  id: 'basketball-court',
  name: 'Basketball Court',
  category: 'sports',
  description: 'Basketball court platform with court reservations, league management, pickup game organization, and training programs',
  icon: 'dribbble',

  keywords: [
    'basketball court',
    'indoor sports',
    'basketball court software',
    'basketball gym',
    'court rental',
    'basketball court management',
    'court reservations',
    'basketball court practice',
    'basketball court scheduling',
    'pickup games',
    'basketball court crm',
    'basketball leagues',
    'basketball court business',
    'training camps',
    'basketball court pos',
    'tournaments',
    'basketball court operations',
    'youth basketball',
    'basketball court services',
    'hoops facility',
  ],

  synonyms: [
    'basketball court platform',
    'basketball court software',
    'indoor sports software',
    'basketball gym software',
    'court rental software',
    'court reservations software',
    'basketball court practice software',
    'pickup games software',
    'basketball leagues software',
    'hoops facility software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Player Portal', enabled: true, basePath: '/', layout: 'public', description: 'Courts and games' },
    { id: 'admin', name: 'Court Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Bookings and leagues' },
  ],

  roles: [
    { id: 'admin', name: 'Facility Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Court Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'referee', name: 'Referee', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/games' },
    { id: 'player', name: 'Player', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build a basketball court platform',
    'Create an indoor sports facility portal',
    'I need a basketball gym management system',
    'Build a court rental business platform',
    'Create a court booking and league app',
  ],
};
