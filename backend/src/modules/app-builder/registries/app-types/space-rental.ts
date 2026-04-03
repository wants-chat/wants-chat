/**
 * Space Rental App Type Definition
 *
 * Complete definition for space rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPACE_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'space-rental',
  name: 'Space Rental',
  category: 'wellness',
  description: 'Space Rental platform with comprehensive management features',
  icon: 'spa',

  keywords: [
      "space rental",
      "space",
      "rental",
      "space software",
      "space app",
      "space platform",
      "space system",
      "space management",
      "wellness space"
  ],

  synonyms: [
      "Space Rental platform",
      "Space Rental software",
      "Space Rental system",
      "space solution",
      "space service"
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
      "appointments",
      "pos-system",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "membership-plans",
      "payments",
      "reviews",
      "gallery",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'wellness',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a space rental platform",
      "Create a space rental app",
      "I need a space rental management system",
      "Build a space rental solution",
      "Create a space rental booking system"
  ],
};
