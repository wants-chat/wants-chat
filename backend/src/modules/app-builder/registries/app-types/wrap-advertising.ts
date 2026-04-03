/**
 * Wrap Advertising App Type Definition
 *
 * Complete definition for wrap advertising applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WRAP_ADVERTISING_APP_TYPE: AppTypeDefinition = {
  id: 'wrap-advertising',
  name: 'Wrap Advertising',
  category: 'services',
  description: 'Wrap Advertising platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wrap advertising",
      "wrap",
      "advertising",
      "wrap software",
      "wrap app",
      "wrap platform",
      "wrap system",
      "wrap management",
      "services wrap"
  ],

  synonyms: [
      "Wrap Advertising platform",
      "Wrap Advertising software",
      "Wrap Advertising system",
      "wrap solution",
      "wrap service"
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
      "Build a wrap advertising platform",
      "Create a wrap advertising app",
      "I need a wrap advertising management system",
      "Build a wrap advertising solution",
      "Create a wrap advertising booking system"
  ],
};
