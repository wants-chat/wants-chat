/**
 * Tv Production App Type Definition
 *
 * Complete definition for tv production applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TV_PRODUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'tv-production',
  name: 'Tv Production',
  category: 'services',
  description: 'Tv Production platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tv production",
      "production",
      "tv software",
      "tv app",
      "tv platform",
      "tv system",
      "tv management",
      "services tv"
  ],

  synonyms: [
      "Tv Production platform",
      "Tv Production software",
      "Tv Production system",
      "tv solution",
      "tv service"
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a tv production platform",
      "Create a tv production app",
      "I need a tv production management system",
      "Build a tv production solution",
      "Create a tv production booking system"
  ],
};
