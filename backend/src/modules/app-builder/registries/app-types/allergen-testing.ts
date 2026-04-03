/**
 * Allergen Testing App Type Definition
 *
 * Complete definition for allergen testing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALLERGEN_TESTING_APP_TYPE: AppTypeDefinition = {
  id: 'allergen-testing',
  name: 'Allergen Testing',
  category: 'services',
  description: 'Allergen Testing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "allergen testing",
      "allergen",
      "testing",
      "allergen software",
      "allergen app",
      "allergen platform",
      "allergen system",
      "allergen management",
      "services allergen"
  ],

  synonyms: [
      "Allergen Testing platform",
      "Allergen Testing software",
      "Allergen Testing system",
      "allergen solution",
      "allergen service"
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
      "Build a allergen testing platform",
      "Create a allergen testing app",
      "I need a allergen testing management system",
      "Build a allergen testing solution",
      "Create a allergen testing booking system"
  ],
};
