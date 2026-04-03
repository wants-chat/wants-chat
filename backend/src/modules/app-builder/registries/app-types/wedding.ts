/**
 * Wedding Planning App Type Definition
 *
 * Complete definition for wedding planning and vendor marketplace applications.
 * Essential for wedding planners, venues, and couples.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEDDING_APP_TYPE: AppTypeDefinition = {
  id: 'wedding',
  name: 'Wedding Planning',
  category: 'events',
  description: 'Wedding planning platform with vendor directory, budgeting, guest management, and checklists',
  icon: 'ring',

  keywords: [
    'wedding',
    'wedding planning',
    'wedding planner',
    'wedding venue',
    'wedding vendors',
    'theknot',
    'weddingwire',
    'zola',
    'bride',
    'groom',
    'bridal',
    'wedding registry',
    'wedding website',
    'rsvp',
    'guest list',
    'seating chart',
    'wedding checklist',
    'wedding budget',
    'wedding timeline',
    'save the date',
    'wedding invitation',
    'reception',
    'ceremony',
    'honeymoon',
  ],

  synonyms: [
    'wedding platform',
    'wedding app',
    'wedding software',
    'bridal platform',
    'wedding management',
    'wedding organizer',
    'wedding marketplace',
    'wedding vendor directory',
    'event planning',
    'wedding coordinator',
  ],

  negativeKeywords: ['blog only', 'portfolio', 'ecommerce', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Wedding Portal', enabled: true, basePath: '/', layout: 'public', description: 'Couple and guest access' },
    { id: 'admin', name: 'Planner Dashboard', enabled: true, basePath: '/admin', requiredRole: 'planner', layout: 'admin', description: 'Wedding planning tools' },
    { id: 'vendor', name: 'Vendor Portal', enabled: true, basePath: '/vendor', requiredRole: 'vendor', layout: 'admin', description: 'Vendor listings and bookings' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin', 'vendor'], defaultRoute: '/admin/dashboard' },
    { id: 'planner', name: 'Wedding Planner', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/weddings' },
    { id: 'vendor', name: 'Vendor', level: 50, isDefault: false, accessibleSections: ['frontend', 'vendor'], defaultRoute: '/vendor/bookings' },
    { id: 'couple', name: 'Couple', level: 30, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/dashboard' },
    { id: 'guest', name: 'Guest', level: 10, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/rsvp' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
  ],

  optionalFeatures: [
    'payments',
    'contracts',
    'gallery',
  ],

  incompatibleFeatures: ['shopping-cart', 'inventory', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'events',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a wedding planning platform',
    'Create a wedding vendor marketplace like The Knot',
    'I need a wedding website builder',
    'Build a wedding RSVP and guest management app',
    'Create a wedding planning app with budgeting',
  ],
};
