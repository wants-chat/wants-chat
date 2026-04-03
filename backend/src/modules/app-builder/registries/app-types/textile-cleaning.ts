/**
 * Textile Cleaning App Type Definition
 *
 * Complete definition for textile cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEXTILE_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'textile-cleaning',
  name: 'Textile Cleaning',
  category: 'services',
  description: 'Textile Cleaning platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "textile cleaning",
      "textile",
      "cleaning",
      "textile software",
      "textile app",
      "textile platform",
      "textile system",
      "textile management",
      "services textile"
  ],

  synonyms: [
      "Textile Cleaning platform",
      "Textile Cleaning software",
      "Textile Cleaning system",
      "textile solution",
      "textile service"
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
      "Build a textile cleaning platform",
      "Create a textile cleaning app",
      "I need a textile cleaning management system",
      "Build a textile cleaning solution",
      "Create a textile cleaning booking system"
  ],
};
