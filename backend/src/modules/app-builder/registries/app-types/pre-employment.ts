/**
 * Pre Employment App Type Definition
 *
 * Complete definition for pre employment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRE_EMPLOYMENT_APP_TYPE: AppTypeDefinition = {
  id: 'pre-employment',
  name: 'Pre Employment',
  category: 'services',
  description: 'Pre Employment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "pre employment",
      "pre",
      "employment",
      "pre software",
      "pre app",
      "pre platform",
      "pre system",
      "pre management",
      "services pre"
  ],

  synonyms: [
      "Pre Employment platform",
      "Pre Employment software",
      "Pre Employment system",
      "pre solution",
      "pre service"
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
      "Build a pre employment platform",
      "Create a pre employment app",
      "I need a pre employment management system",
      "Build a pre employment solution",
      "Create a pre employment booking system"
  ],
};
