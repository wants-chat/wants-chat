/**
 * Safe & Vault App Type Definition
 *
 * Complete definition for safe and vault services.
 * Essential for safe dealers, vault services, and secure storage.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SAFE_VAULT_APP_TYPE: AppTypeDefinition = {
  id: 'safe-vault',
  name: 'Safe & Vault',
  category: 'security',
  description: 'Safe and vault platform with product catalog, installation scheduling, service management, and combination management',
  icon: 'box',

  keywords: [
    'safe vault',
    'safe dealer',
    'safe vault software',
    'secure storage',
    'gun safes',
    'safe vault management',
    'product catalog',
    'safe vault practice',
    'safe vault scheduling',
    'installation scheduling',
    'safe vault crm',
    'fireproof safes',
    'safe vault business',
    'combination changes',
    'safe vault pos',
    'bank vaults',
    'safe vault operations',
    'safe moving',
    'safe vault platform',
    'depository safes',
  ],

  synonyms: [
    'safe vault platform',
    'safe vault software',
    'safe dealer software',
    'secure storage software',
    'gun safes software',
    'product catalog software',
    'safe vault practice software',
    'installation scheduling software',
    'fireproof safes software',
    'depository safes software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and services' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Sales and jobs' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/sales' },
    { id: 'tech', name: 'Safe Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/service' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'product-catalog',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'car-inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'security',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a safe and vault sales platform',
    'Create a safe dealer management portal',
    'I need a secure storage service system',
    'Build a safe installation scheduling platform',
    'Create a product catalog and service app',
  ],
};
