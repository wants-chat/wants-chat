/**
 * Event Security App Type Definition
 *
 * Complete definition for event security applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EVENT_SECURITY_APP_TYPE: AppTypeDefinition = {
  id: 'event-security',
  name: 'Event Security',
  category: 'events',
  description: 'Event Security platform with comprehensive management features',
  icon: 'calendar',

  keywords: [
      "event security",
      "event",
      "security",
      "event software",
      "event app",
      "event platform",
      "event system",
      "event management",
      "events event"
  ],

  synonyms: [
      "Event Security platform",
      "Event Security software",
      "Event Security system",
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
      "Build a event security platform",
      "Create a event security app",
      "I need a event security management system",
      "Build a event security solution",
      "Create a event security booking system"
  ],
};
