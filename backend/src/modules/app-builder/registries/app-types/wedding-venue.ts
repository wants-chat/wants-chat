/**
 * Wedding Venue App Type Definition
 *
 * Complete definition for wedding venue applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEDDING_VENUE_APP_TYPE: AppTypeDefinition = {
  id: 'wedding-venue',
  name: 'Wedding Venue',
  category: 'entertainment',
  description: 'Wedding Venue platform with comprehensive management features',
  icon: 'building',

  keywords: [
      "wedding venue",
      "wedding",
      "venue",
      "wedding software",
      "wedding app",
      "wedding platform",
      "wedding system",
      "wedding management",
      "events wedding"
  ],

  synonyms: [
      "Wedding Venue platform",
      "Wedding Venue software",
      "Wedding Venue system",
      "wedding solution",
      "wedding service"
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
      "Build a wedding venue platform",
      "Create a wedding venue app",
      "I need a wedding venue management system",
      "Build a wedding venue solution",
      "Create a wedding venue booking system"
  ],
};
