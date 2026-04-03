/**
 * Warehousing App Type Definition
 *
 * Complete definition for warehousing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WAREHOUSING_APP_TYPE: AppTypeDefinition = {
  id: 'warehousing',
  name: 'Warehousing',
  category: 'services',
  description: 'Warehousing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "warehousing",
      "warehousing software",
      "warehousing app",
      "warehousing platform",
      "warehousing system",
      "warehousing management",
      "services warehousing"
  ],

  synonyms: [
      "Warehousing platform",
      "Warehousing software",
      "Warehousing system",
      "warehousing solution",
      "warehousing service"
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
      "Build a warehousing platform",
      "Create a warehousing app",
      "I need a warehousing management system",
      "Build a warehousing solution",
      "Create a warehousing booking system"
  ],
};
