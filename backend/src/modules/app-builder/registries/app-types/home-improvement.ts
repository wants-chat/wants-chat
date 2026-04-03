/**
 * Home Improvement App Type Definition
 *
 * Complete definition for home improvement applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOME_IMPROVEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'home-improvement',
  name: 'Home Improvement',
  category: 'services',
  description: 'Home Improvement platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "home improvement",
      "home",
      "improvement",
      "home software",
      "home app",
      "home platform",
      "home system",
      "home management",
      "services home"
  ],

  synonyms: [
      "Home Improvement platform",
      "Home Improvement software",
      "Home Improvement system",
      "home solution",
      "home service"
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
      "Build a home improvement platform",
      "Create a home improvement app",
      "I need a home improvement management system",
      "Build a home improvement solution",
      "Create a home improvement booking system"
  ],
};
