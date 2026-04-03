/**
 * Office Cleaning App Type Definition
 *
 * Complete definition for office cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OFFICE_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'office-cleaning',
  name: 'Office Cleaning',
  category: 'services',
  description: 'Office Cleaning platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "office cleaning",
      "office",
      "cleaning",
      "office software",
      "office app",
      "office platform",
      "office system",
      "office management",
      "services office"
  ],

  synonyms: [
      "Office Cleaning platform",
      "Office Cleaning software",
      "Office Cleaning system",
      "office solution",
      "office service"
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
      "Build a office cleaning platform",
      "Create a office cleaning app",
      "I need a office cleaning management system",
      "Build a office cleaning solution",
      "Create a office cleaning booking system"
  ],
};
