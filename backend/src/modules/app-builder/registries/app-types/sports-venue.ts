/**
 * Sports Venue App Type Definition
 *
 * Complete definition for sports venue applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTS_VENUE_APP_TYPE: AppTypeDefinition = {
  id: 'sports-venue',
  name: 'Sports Venue',
  category: 'entertainment',
  description: 'Sports Venue platform with comprehensive management features',
  icon: 'building',

  keywords: [
      "sports venue",
      "sports",
      "venue",
      "sports software",
      "sports app",
      "sports platform",
      "sports system",
      "sports management",
      "events sports"
  ],

  synonyms: [
      "Sports Venue platform",
      "Sports Venue software",
      "Sports Venue system",
      "sports solution",
      "sports service"
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
      "Build a sports venue platform",
      "Create a sports venue app",
      "I need a sports venue management system",
      "Build a sports venue solution",
      "Create a sports venue booking system"
  ],
};
