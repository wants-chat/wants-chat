/**
 * Utility Locating App Type Definition
 *
 * Complete definition for utility locating applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UTILITY_LOCATING_APP_TYPE: AppTypeDefinition = {
  id: 'utility-locating',
  name: 'Utility Locating',
  category: 'services',
  description: 'Utility Locating platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "utility locating",
      "utility",
      "locating",
      "utility software",
      "utility app",
      "utility platform",
      "utility system",
      "utility management",
      "services utility"
  ],

  synonyms: [
      "Utility Locating platform",
      "Utility Locating software",
      "Utility Locating system",
      "utility solution",
      "utility service"
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
      "Build a utility locating platform",
      "Create a utility locating app",
      "I need a utility locating management system",
      "Build a utility locating solution",
      "Create a utility locating booking system"
  ],
};
