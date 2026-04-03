/**
 * Mattress Cleaning App Type Definition
 *
 * Complete definition for mattress cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MATTRESS_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'mattress-cleaning',
  name: 'Mattress Cleaning',
  category: 'services',
  description: 'Mattress Cleaning platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "mattress cleaning",
      "mattress",
      "cleaning",
      "mattress software",
      "mattress app",
      "mattress platform",
      "mattress system",
      "mattress management",
      "services mattress"
  ],

  synonyms: [
      "Mattress Cleaning platform",
      "Mattress Cleaning software",
      "Mattress Cleaning system",
      "mattress solution",
      "mattress service"
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
      "Build a mattress cleaning platform",
      "Create a mattress cleaning app",
      "I need a mattress cleaning management system",
      "Build a mattress cleaning solution",
      "Create a mattress cleaning booking system"
  ],
};
