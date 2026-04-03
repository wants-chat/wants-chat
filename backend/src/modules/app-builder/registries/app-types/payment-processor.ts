/**
 * Payment Processor App Type Definition
 *
 * Complete definition for payment processing company operations.
 * Essential for payment processors, merchant services, and fintech companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PAYMENT_PROCESSOR_APP_TYPE: AppTypeDefinition = {
  id: 'payment-processor',
  name: 'Payment Processor',
  category: 'finance',
  description: 'Payment processor platform with merchant onboarding, transaction monitoring, settlement management, and fraud prevention',
  icon: 'credit-card',

  keywords: [
    'payment processor',
    'merchant services',
    'payment processor software',
    'fintech',
    'payment gateway',
    'payment processor management',
    'merchant onboarding',
    'payment processor practice',
    'payment processor scheduling',
    'transaction monitoring',
    'payment processor crm',
    'settlement management',
    'payment processor business',
    'fraud prevention',
    'payment processor pos',
    'chargeback handling',
    'payment processor operations',
    'pci compliance',
    'payment processor platform',
    'interchange',
  ],

  synonyms: [
    'payment processor platform',
    'payment processor software',
    'merchant services software',
    'fintech software',
    'payment gateway software',
    'merchant onboarding software',
    'payment processor practice software',
    'transaction monitoring software',
    'settlement management software',
    'fraud prevention software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Merchant Portal', enabled: true, basePath: '/', layout: 'public', description: 'Transactions and settlements' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Merchants and risk' },
  ],

  roles: [
    { id: 'admin', name: 'CEO', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'risk', name: 'Risk Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/risk' },
    { id: 'support', name: 'Merchant Support', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/merchants' },
    { id: 'merchant', name: 'Merchant', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a payment processor platform',
    'Create a merchant services portal',
    'I need a payment processing system',
    'Build a transaction monitoring platform',
    'Create a settlement and fraud app',
  ],
};
