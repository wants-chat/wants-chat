/**
 * Auto Auction App Type Definition
 *
 * Complete definition for automotive auction operations.
 * Essential for auto auctions, dealer auctions, and vehicle remarketing.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTO_AUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'auto-auction',
  name: 'Auto Auction',
  category: 'automotive',
  description: 'Auto auction platform with vehicle listings, live bidding, condition reports, and title processing',
  icon: 'gavel',

  keywords: [
    'auto auction',
    'dealer auction',
    'auto auction software',
    'vehicle remarketing',
    'wholesale auction',
    'auto auction management',
    'vehicle listings',
    'auto auction practice',
    'auto auction scheduling',
    'live bidding',
    'auto auction crm',
    'condition reports',
    'auto auction business',
    'title processing',
    'auto auction pos',
    'salvage auction',
    'auto auction operations',
    'fleet disposal',
    'auto auction platform',
    'simulcast bidding',
  ],

  synonyms: [
    'auto auction platform',
    'auto auction software',
    'dealer auction software',
    'vehicle remarketing software',
    'wholesale auction software',
    'vehicle listings software',
    'auto auction practice software',
    'live bidding software',
    'condition reports software',
    'fleet disposal software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Bidder Portal', enabled: true, basePath: '/', layout: 'public', description: 'Auctions and bidding' },
    { id: 'admin', name: 'Auction Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and sales' },
  ],

  roles: [
    { id: 'admin', name: 'Auction Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'auctioneer', name: 'Auctioneer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/lanes' },
    { id: 'clerk', name: 'Auction Clerk', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/vehicles' },
    { id: 'bidder', name: 'Bidder', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'vehicle-inventory',
    'vehicle-history',
    'trade-in-valuation',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'vehicle-financing',
    'recalls-tracking',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an auto auction platform',
    'Create a dealer auction portal',
    'I need a vehicle auction system',
    'Build a live bidding platform',
    'Create an automotive remarketing app',
  ],
};
