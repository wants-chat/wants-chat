/**
 * Venue Management App Type Definition
 *
 * Complete definition for venue management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VENUE_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'venue-management',
  name: 'Venue Management',
  category: 'entertainment',
  description: 'Venue Management platform with comprehensive management features',
  icon: 'building',

  keywords: [
      "venue management",
      "venue",
      "management",
      "venue software",
      "venue app",
      "venue platform",
      "venue system",
      "events venue"
  ],

  synonyms: [
      "Venue Management platform",
      "Venue Management software",
      "Venue Management system",
      "venue solution",
      "venue service"
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
      "reservations",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "seating-charts",
      "payments",
      "gallery",
      "reviews",
      "contracts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'events',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a venue management platform",
      "Create a venue management app",
      "I need a venue management management system",
      "Build a venue management solution",
      "Create a venue management booking system"
  ],
};
