/**
 * Ticket Sales App Type Definition
 *
 * Complete definition for ticket sales and event ticketing applications.
 * Essential for event organizers, venues, and ticketing platforms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TICKET_SALES_APP_TYPE: AppTypeDefinition = {
  id: 'ticket-sales',
  name: 'Ticket Sales',
  category: 'events',
  description: 'Ticket sales platform with event listings, seat selection, mobile tickets, and box office management',
  icon: 'ticket',

  keywords: [
    'ticket sales',
    'event tickets',
    'ticketing',
    'eventbrite',
    'ticketmaster',
    'concert tickets',
    'show tickets',
    'sports tickets',
    'theater tickets',
    'festival tickets',
    'box office',
    'ticket booking',
    'seat selection',
    'mobile tickets',
    'e-tickets',
    'ticket resale',
    'ticket transfer',
    'season tickets',
    'ticket scanning',
    'admission tickets',
    'venue ticketing',
  ],

  synonyms: [
    'ticket sales platform',
    'ticketing software',
    'event ticketing platform',
    'ticket booking software',
    'ticket sales app',
    'box office software',
    'ticket management system',
    'event ticketing software',
    'online ticketing platform',
    'ticket selling app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Ticket Portal', enabled: true, basePath: '/', layout: 'public', description: 'Browse and buy tickets' },
    { id: 'admin', name: 'Organizer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'organizer', layout: 'admin', description: 'Events and sales management' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'organizer', name: 'Event Organizer', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/events' },
    { id: 'venue', name: 'Venue Manager', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/venue' },
    { id: 'boxoffice', name: 'Box Office', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sales' },
    { id: 'scanner', name: 'Door Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/scan' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'waitlist',
    'analytics',
  ],

  incompatibleFeatures: ['medical-records', 'course-management', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'events',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'vibrant',

  examplePrompts: [
    'Build a ticket sales platform',
    'Create an event ticketing system like Eventbrite',
    'I need a box office management app',
    'Build a concert ticket selling platform',
    'Create a venue ticketing system',
  ],
};
