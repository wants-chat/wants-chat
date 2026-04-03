/**
 * Residential Cleaning App Type Definition
 *
 * Complete definition for residential cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESIDENTIAL_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'residential-cleaning',
  name: 'Residential Cleaning',
  category: 'services',
  description: 'Residential Cleaning platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "residential cleaning",
      "residential",
      "cleaning",
      "residential software",
      "residential app",
      "residential platform",
      "residential system",
      "residential management",
      "services residential"
  ],

  synonyms: [
      "Residential Cleaning platform",
      "Residential Cleaning software",
      "Residential Cleaning system",
      "residential solution",
      "residential service"
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
      "Build a residential cleaning platform",
      "Create a residential cleaning app",
      "I need a residential cleaning management system",
      "Build a residential cleaning solution",
      "Create a residential cleaning booking system"
  ],
};
