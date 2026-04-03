/**
 * Author Services App Type Definition
 *
 * Complete definition for author services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTHOR_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'author-services',
  name: 'Author Services',
  category: 'services',
  description: 'Author Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "author services",
      "author",
      "services",
      "author software",
      "author app",
      "author platform",
      "author system",
      "author management",
      "services author"
  ],

  synonyms: [
      "Author Services platform",
      "Author Services software",
      "Author Services system",
      "author solution",
      "author service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a author services platform",
      "Create a author services app",
      "I need a author services management system",
      "Build a author services solution",
      "Create a author services booking system"
  ],
};
