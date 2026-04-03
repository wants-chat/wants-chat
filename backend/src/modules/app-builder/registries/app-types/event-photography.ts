/**
 * Event Photography App Type Definition
 *
 * Complete definition for event photography applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EVENT_PHOTOGRAPHY_APP_TYPE: AppTypeDefinition = {
  id: 'event-photography',
  name: 'Event Photography',
  category: 'events',
  description: 'Event Photography platform with comprehensive management features',
  icon: 'calendar',

  keywords: [
      "event photography",
      "event",
      "photography",
      "event software",
      "event app",
      "event platform",
      "event system",
      "event management",
      "events event"
  ],

  synonyms: [
      "Event Photography platform",
      "Event Photography software",
      "Event Photography system",
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
      "Build a event photography platform",
      "Create a event photography app",
      "I need a event photography management system",
      "Build a event photography solution",
      "Create a event photography booking system"
  ],
};
