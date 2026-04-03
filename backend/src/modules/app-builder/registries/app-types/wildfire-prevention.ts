/**
 * Wildfire Prevention App Type Definition
 *
 * Complete definition for wildfire prevention applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WILDFIRE_PREVENTION_APP_TYPE: AppTypeDefinition = {
  id: 'wildfire-prevention',
  name: 'Wildfire Prevention',
  category: 'events',
  description: 'Wildfire Prevention platform with comprehensive management features',
  icon: 'calendar',

  keywords: [
      "wildfire prevention",
      "wildfire",
      "prevention",
      "wildfire software",
      "wildfire app",
      "wildfire platform",
      "wildfire system",
      "wildfire management",
      "events wildfire"
  ],

  synonyms: [
      "Wildfire Prevention platform",
      "Wildfire Prevention software",
      "Wildfire Prevention system",
      "wildfire solution",
      "wildfire service"
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
      "Build a wildfire prevention platform",
      "Create a wildfire prevention app",
      "I need a wildfire prevention management system",
      "Build a wildfire prevention solution",
      "Create a wildfire prevention booking system"
  ],
};
