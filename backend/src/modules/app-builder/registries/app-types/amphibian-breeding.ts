/**
 * Amphibian Breeding App Type Definition
 *
 * Complete definition for amphibian breeding applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AMPHIBIAN_BREEDING_APP_TYPE: AppTypeDefinition = {
  id: 'amphibian-breeding',
  name: 'Amphibian Breeding',
  category: 'services',
  description: 'Amphibian Breeding platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "amphibian breeding",
      "amphibian",
      "breeding",
      "amphibian software",
      "amphibian app",
      "amphibian platform",
      "amphibian system",
      "amphibian management",
      "services amphibian"
  ],

  synonyms: [
      "Amphibian Breeding platform",
      "Amphibian Breeding software",
      "Amphibian Breeding system",
      "amphibian solution",
      "amphibian service"
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
      "Build a amphibian breeding platform",
      "Create a amphibian breeding app",
      "I need a amphibian breeding management system",
      "Build a amphibian breeding solution",
      "Create a amphibian breeding booking system"
  ],
};
