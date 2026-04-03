/**
 * Book Subscription App Type Definition
 *
 * Complete definition for book subscription services.
 * Essential for book clubs, book boxes, and reading subscriptions.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOOK_SUBSCRIPTION_APP_TYPE: AppTypeDefinition = {
  id: 'book-subscription',
  name: 'Book Subscription',
  category: 'subscription',
  description: 'Book subscription platform with genre preferences, reading lists, book reviews, and discussion groups',
  icon: 'book-open',

  keywords: [
    'book subscription',
    'book club',
    'book subscription software',
    'book box',
    'reading subscription',
    'book subscription management',
    'genre preferences',
    'book subscription practice',
    'book subscription scheduling',
    'reading lists',
    'book subscription crm',
    'book reviews',
    'book subscription business',
    'discussion groups',
    'book subscription pos',
    'author picks',
    'book subscription operations',
    'literary gifts',
    'book subscription platform',
    'curated reading',
  ],

  synonyms: [
    'book subscription platform',
    'book subscription software',
    'book club software',
    'book box software',
    'reading subscription software',
    'genre preferences software',
    'book subscription practice software',
    'reading lists software',
    'book reviews software',
    'curated reading software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'automotive'],

  sections: [
    { id: 'frontend', name: 'Reader Portal', enabled: true, basePath: '/', layout: 'public', description: 'Books and discussions' },
    { id: 'admin', name: 'Club Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and shipments' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'curator', name: 'Book Curator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/selections' },
    { id: 'staff', name: 'Fulfillment Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/shipments' },
    { id: 'member', name: 'Reader', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'literary',

  examplePrompts: [
    'Build a book subscription platform',
    'Create a book club portal',
    'I need a reading subscription management system',
    'Build a book box delivery platform',
    'Create a reading list and discussion app',
  ],
};
