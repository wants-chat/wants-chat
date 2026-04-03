/**
 * Utility Management App Type Definition
 *
 * Complete definition for utility management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UTILITY_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'utility-management',
  name: 'Utility Management',
  category: 'services',
  description: 'Utility Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "utility management",
      "utility",
      "management",
      "utility software",
      "utility app",
      "utility platform",
      "utility system",
      "services utility"
  ],

  synonyms: [
      "Utility Management platform",
      "Utility Management software",
      "Utility Management system",
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
      "Build a utility management platform",
      "Create a utility management app",
      "I need a utility management management system",
      "Build a utility management solution",
      "Create a utility management booking system"
  ],
};
