/**
 * Special Events App Type Definition
 *
 * Complete definition for special events applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPECIAL_EVENTS_APP_TYPE: AppTypeDefinition = {
  id: 'special-events',
  name: 'Special Events',
  category: 'events',
  description: 'Special Events platform with comprehensive management features',
  icon: 'calendar',

  keywords: [
      "special events",
      "special",
      "events",
      "special software",
      "special app",
      "special platform",
      "special system",
      "special management",
      "events special"
  ],

  synonyms: [
      "Special Events platform",
      "Special Events software",
      "Special Events system",
      "special solution",
      "special service"
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
      "Build a special events platform",
      "Create a special events app",
      "I need a special events management system",
      "Build a special events solution",
      "Create a special events booking system"
  ],
};
