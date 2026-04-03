/**
 * Event Decoration App Type Definition
 *
 * Complete definition for event decoration applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EVENT_DECORATION_APP_TYPE: AppTypeDefinition = {
  id: 'event-decoration',
  name: 'Event Decoration',
  category: 'events',
  description: 'Event Decoration platform with comprehensive management features',
  icon: 'calendar',

  keywords: [
      "event decoration",
      "event",
      "decoration",
      "event software",
      "event app",
      "event platform",
      "event system",
      "event management",
      "events event"
  ],

  synonyms: [
      "Event Decoration platform",
      "Event Decoration software",
      "Event Decoration system",
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
      "Build a event decoration platform",
      "Create a event decoration app",
      "I need a event decoration management system",
      "Build a event decoration solution",
      "Create a event decoration booking system"
  ],
};
