/**
 * Home Office App Type Definition
 *
 * Complete definition for home office applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOME_OFFICE_APP_TYPE: AppTypeDefinition = {
  id: 'home-office',
  name: 'Home Office',
  category: 'services',
  description: 'Home Office platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "home office",
      "home",
      "office",
      "home software",
      "home app",
      "home platform",
      "home system",
      "home management",
      "services home"
  ],

  synonyms: [
      "Home Office platform",
      "Home Office software",
      "Home Office system",
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
      "Build a home office platform",
      "Create a home office app",
      "I need a home office management system",
      "Build a home office solution",
      "Create a home office booking system"
  ],
};
