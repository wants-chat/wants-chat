/**
 * Awning Cleaning App Type Definition
 *
 * Complete definition for awning cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AWNING_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'awning-cleaning',
  name: 'Awning Cleaning',
  category: 'services',
  description: 'Awning Cleaning platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "awning cleaning",
      "awning",
      "cleaning",
      "awning software",
      "awning app",
      "awning platform",
      "awning system",
      "awning management",
      "services awning"
  ],

  synonyms: [
      "Awning Cleaning platform",
      "Awning Cleaning software",
      "Awning Cleaning system",
      "awning solution",
      "awning service"
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
      "Build a awning cleaning platform",
      "Create a awning cleaning app",
      "I need a awning cleaning management system",
      "Build a awning cleaning solution",
      "Create a awning cleaning booking system"
  ],
};
