/**
 * Sporting Events App Type Definition
 *
 * Complete definition for sporting events applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTING_EVENTS_APP_TYPE: AppTypeDefinition = {
  id: 'sporting-events',
  name: 'Sporting Events',
  category: 'events',
  description: 'Sporting Events platform with comprehensive management features',
  icon: 'calendar',

  keywords: [
      "sporting events",
      "sporting",
      "events",
      "sporting software",
      "sporting app",
      "sporting platform",
      "sporting system",
      "sporting management",
      "events sporting"
  ],

  synonyms: [
      "Sporting Events platform",
      "Sporting Events software",
      "Sporting Events system",
      "sporting solution",
      "sporting service"
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
      "Build a sporting events platform",
      "Create a sporting events app",
      "I need a sporting events management system",
      "Build a sporting events solution",
      "Create a sporting events booking system"
  ],
};
