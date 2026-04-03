/**
 * Auction App Type Definition
 *
 * Complete definition for auction and bidding platform applications.
 * Essential for auction houses, online auctions, and bidding marketplaces.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'auction',
  name: 'Auction',
  category: 'ecommerce',
  description: 'Auction platform with live bidding, catalog management, buyer registration, and payment processing',
  icon: 'gavel',

  keywords: [
    'auction',
    'bidding',
    'online auction',
    'live auction',
    'auction house',
    'ebay',
    'auction site',
    'bid platform',
    'auction marketplace',
    'estate auction',
    'car auction',
    'art auction',
    'antique auction',
    'silent auction',
    'charity auction',
    'real estate auction',
    'equipment auction',
    'government auction',
    'liquidation auction',
    'timed auction',
    'proxy bidding',
  ],

  synonyms: [
    'auction platform',
    'auction software',
    'bidding platform',
    'online auction software',
    'auction management system',
    'auction website builder',
    'live auction software',
    'auction marketplace',
    'bidding software',
    'auction house software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Buyer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Browse and bid on items' },
    { id: 'admin', name: 'Auctioneer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'auctioneer', layout: 'admin', description: 'Manage auctions and catalog' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'auctioneer', name: 'Auctioneer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/auctions' },
    { id: 'consignor', name: 'Consignor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/consignments' },
    { id: 'staff', name: 'Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/lots' },
    { id: 'bidder', name: 'Bidder', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'shipping',
    'analytics',
  ],

  incompatibleFeatures: ['medical-records', 'course-management', 'workout-plans'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'ecommerce',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'classic',

  examplePrompts: [
    'Build an online auction platform',
    'Create a bidding marketplace like eBay',
    'I need an auction house management system',
    'Build a live auction platform with streaming',
    'Create a charity auction website',
  ],
};
