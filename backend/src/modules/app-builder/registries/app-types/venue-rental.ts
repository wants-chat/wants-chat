/**
 * Venue Rental App Type Definition
 *
 * Complete definition for venue rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VENUE_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'venue-rental',
  name: 'Venue Rental',
  category: 'rental',
  description: 'Venue Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "venue rental",
      "venue",
      "rental",
      "venue software",
      "venue app",
      "venue platform",
      "venue system",
      "venue management",
      "rental venue"
  ],

  synonyms: [
      "Venue Rental platform",
      "Venue Rental software",
      "Venue Rental system",
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
      "Build a venue rental platform",
      "Create a venue rental app",
      "I need a venue rental management system",
      "Build a venue rental solution",
      "Create a venue rental booking system"
  ],
};
