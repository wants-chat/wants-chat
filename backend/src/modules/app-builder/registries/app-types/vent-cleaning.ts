/**
 * Vent Cleaning App Type Definition
 *
 * Complete definition for vent cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VENT_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'vent-cleaning',
  name: 'Vent Cleaning',
  category: 'services',
  description: 'Vent Cleaning platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "vent cleaning",
      "vent",
      "cleaning",
      "vent software",
      "vent app",
      "vent platform",
      "vent system",
      "vent management",
      "services vent"
  ],

  synonyms: [
      "Vent Cleaning platform",
      "Vent Cleaning software",
      "Vent Cleaning system",
      "vent solution",
      "vent service"
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
      "Build a vent cleaning platform",
      "Create a vent cleaning app",
      "I need a vent cleaning management system",
      "Build a vent cleaning solution",
      "Create a vent cleaning booking system"
  ],
};
