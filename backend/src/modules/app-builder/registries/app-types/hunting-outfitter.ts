/**
 * Hunting Outfitter App Type Definition
 *
 * Complete definition for hunting outfitter operations.
 * Essential for hunting guides, outfitters, and wildlife management.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HUNTING_OUTFITTER_APP_TYPE: AppTypeDefinition = {
  id: 'hunting-outfitter',
  name: 'Hunting Outfitter',
  category: 'outdoor',
  description: 'Hunting outfitter platform with hunt booking, guide scheduling, license verification, and game tracking',
  icon: 'target',

  keywords: [
    'hunting outfitter',
    'hunting guide',
    'hunting outfitter software',
    'wildlife management',
    'guided hunts',
    'hunting outfitter management',
    'hunt booking',
    'hunting outfitter practice',
    'hunting outfitter scheduling',
    'guide scheduling',
    'hunting outfitter crm',
    'license verification',
    'hunting outfitter business',
    'game tracking',
    'hunting outfitter pos',
    'trophy hunts',
    'hunting outfitter operations',
    'lodge accommodations',
    'hunting outfitter platform',
    'safari bookings',
  ],

  synonyms: [
    'hunting outfitter platform',
    'hunting outfitter software',
    'hunting guide software',
    'wildlife management software',
    'guided hunts software',
    'hunt booking software',
    'hunting outfitter practice software',
    'guide scheduling software',
    'license verification software',
    'safari bookings software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Hunter Portal', enabled: true, basePath: '/', layout: 'public', description: 'Hunts and booking' },
    { id: 'admin', name: 'Outfitter Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Bookings and guides' },
  ],

  roles: [
    { id: 'admin', name: 'Outfitter Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'guide', name: 'Hunting Guide', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'hunter', name: 'Hunter', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'car-inventory', 'vegetarian-menu'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'outdoor',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'rustic',

  examplePrompts: [
    'Build a hunting outfitter platform',
    'Create a guided hunt booking portal',
    'I need a hunting guide scheduling system',
    'Build a wildlife outfitter platform',
    'Create a hunt booking and game tracking app',
  ],
};
