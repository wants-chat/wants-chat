/**
 * Peer Lending App Type Definition
 *
 * Complete definition for peer-to-peer lending platform operations.
 * Essential for P2P lending platforms, marketplace lenders, and social lending sites.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PEER_LENDING_APP_TYPE: AppTypeDefinition = {
  id: 'peer-lending',
  name: 'Peer Lending',
  category: 'finance',
  description: 'Peer lending platform with borrower applications, investor matching, loan servicing, and portfolio management',
  icon: 'users',

  keywords: [
    'peer lending',
    'p2p lending',
    'peer lending software',
    'marketplace lending',
    'social lending',
    'peer lending management',
    'borrower applications',
    'peer lending practice',
    'peer lending scheduling',
    'investor matching',
    'peer lending crm',
    'loan servicing',
    'peer lending business',
    'portfolio management',
    'peer lending pos',
    'credit scoring',
    'peer lending operations',
    'loan origination',
    'peer lending platform',
    'secondary market',
  ],

  synonyms: [
    'peer lending platform',
    'peer lending software',
    'p2p lending software',
    'marketplace lending software',
    'social lending software',
    'borrower applications software',
    'peer lending practice software',
    'investor matching software',
    'loan servicing software',
    'loan origination software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Loans and investments' },
    { id: 'admin', name: 'Platform Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Loans and investors' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'underwriter', name: 'Underwriter', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/applications' },
    { id: 'servicing', name: 'Loan Servicing', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/loans' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a peer lending platform',
    'Create a P2P lending portal',
    'I need a marketplace lending system',
    'Build a borrower and investor platform',
    'Create a loan servicing app',
  ],
};
