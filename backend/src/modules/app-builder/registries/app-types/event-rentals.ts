/**
 * Event Rentals App Type Definition
 *
 * Complete definition for event rentals applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EVENT_RENTALS_APP_TYPE: AppTypeDefinition = {
  id: 'event-rentals',
  name: 'Event Rentals',
  category: 'rental',
  description: 'Event Rentals platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "event rentals",
      "event",
      "rentals",
      "event software",
      "event app",
      "event platform",
      "event system",
      "event management",
      "rental event"
  ],

  synonyms: [
      "Event Rentals platform",
      "Event Rentals software",
      "Event Rentals system",
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
      "inventory",
      "reservations",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "invoicing",
      "check-in",
      "reviews",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'rental',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a event rentals platform",
      "Create a event rentals app",
      "I need a event rentals management system",
      "Build a event rentals solution",
      "Create a event rentals booking system"
  ],
};
