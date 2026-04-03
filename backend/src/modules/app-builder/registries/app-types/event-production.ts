/**
 * Event Production App Type Definition
 *
 * Complete definition for event production applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EVENT_PRODUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'event-production',
  name: 'Event Production',
  category: 'events',
  description: 'Event Production platform with comprehensive management features',
  icon: 'calendar',

  keywords: [
      "event production",
      "event",
      "production",
      "event software",
      "event app",
      "event platform",
      "event system",
      "event management",
      "events event"
  ],

  synonyms: [
      "Event Production platform",
      "Event Production software",
      "Event Production system",
      "event solution",
      "event service"
  ],

  negativeKeywords: ['blog', 'portfolio'],

  sections: [
      {
          "id": "frontend",
          "name": "Public Portal",
          "enabled": true,
          "basePath": "/",
          "layout": "public",
          "description": "Public-facing interface"
      },
      {
          "id": "admin",
          "name": "Admin Dashboard",
          "enabled": true,
          "basePath": "/admin",
          "requiredRole": "staff",
          "layout": "admin",
          "description": "Administrative interface"
      }
  ],

  roles: [
      {
          "id": "admin",
          "name": "Administrator",
          "level": 100,
          "isDefault": false,
          "accessibleSections": [
              "frontend",
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "staff",
          "name": "Staff",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "User",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "venue-booking",
      "calendar",
      "reservations",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "ticket-sales",
      "payments",
      "gallery",
      "reviews",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'events',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a event production platform",
      "Create a event production app",
      "I need a event production management system",
      "Build a event production solution",
      "Create a event production booking system"
  ],
};
