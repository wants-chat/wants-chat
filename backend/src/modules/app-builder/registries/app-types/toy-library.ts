/**
 * Toy Library App Type Definition
 *
 * Complete definition for toy library applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOY_LIBRARY_APP_TYPE: AppTypeDefinition = {
  id: 'toy-library',
  name: 'Toy Library',
  category: 'services',
  description: 'Toy Library platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "toy library",
      "toy",
      "library",
      "toy software",
      "toy app",
      "toy platform",
      "toy system",
      "toy management",
      "services toy"
  ],

  synonyms: [
      "Toy Library platform",
      "Toy Library software",
      "Toy Library system",
      "toy solution",
      "toy service"
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
      "Build a toy library platform",
      "Create a toy library app",
      "I need a toy library management system",
      "Build a toy library solution",
      "Create a toy library booking system"
  ],
};
