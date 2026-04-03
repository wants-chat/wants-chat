/**
 * Crypto Exchange App Type Definition
 *
 * Complete definition for cryptocurrency exchange operations.
 * Essential for crypto exchanges, digital asset platforms, and trading platforms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CRYPTO_EXCHANGE_APP_TYPE: AppTypeDefinition = {
  id: 'crypto-exchange',
  name: 'Crypto Exchange',
  category: 'finance',
  description: 'Crypto exchange platform with trading engine, wallet management, KYC verification, and market data',
  icon: 'bitcoin',

  keywords: [
    'crypto exchange',
    'cryptocurrency',
    'crypto exchange software',
    'digital assets',
    'trading platform',
    'crypto exchange management',
    'trading engine',
    'crypto exchange practice',
    'crypto exchange scheduling',
    'wallet management',
    'crypto exchange crm',
    'kyc verification',
    'crypto exchange business',
    'market data',
    'crypto exchange pos',
    'order matching',
    'crypto exchange operations',
    'liquidity',
    'crypto exchange platform',
    'blockchain',
  ],

  synonyms: [
    'crypto exchange platform',
    'crypto exchange software',
    'cryptocurrency software',
    'digital assets software',
    'trading platform software',
    'trading engine software',
    'crypto exchange practice software',
    'wallet management software',
    'kyc verification software',
    'blockchain software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Trading Portal', enabled: true, basePath: '/', layout: 'public', description: 'Markets and trading' },
    { id: 'admin', name: 'Exchange Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Operations and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Exchange Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'compliance', name: 'Compliance Officer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/kyc' },
    { id: 'support', name: 'Support Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tickets' },
    { id: 'trader', name: 'Trader', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'finance',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a crypto exchange platform',
    'Create a cryptocurrency trading portal',
    'I need a digital asset exchange system',
    'Build a wallet and trading platform',
    'Create a crypto KYC app',
  ],
};
