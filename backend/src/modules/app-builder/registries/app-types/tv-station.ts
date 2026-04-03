/**
 * Tv Station App Type Definition
 *
 * Complete definition for tv station applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TV_STATION_APP_TYPE: AppTypeDefinition = {
  id: 'tv-station',
  name: 'Tv Station',
  category: 'services',
  description: 'Tv Station platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tv station",
      "station",
      "tv software",
      "tv app",
      "tv platform",
      "tv system",
      "tv management",
      "services tv"
  ],

  synonyms: [
      "Tv Station platform",
      "Tv Station software",
      "Tv Station system",
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
      "Build a tv station platform",
      "Create a tv station app",
      "I need a tv station management system",
      "Build a tv station solution",
      "Create a tv station booking system"
  ],
};
