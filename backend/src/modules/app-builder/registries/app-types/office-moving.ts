/**
 * Office Moving App Type Definition
 *
 * Complete definition for office moving applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OFFICE_MOVING_APP_TYPE: AppTypeDefinition = {
  id: 'office-moving',
  name: 'Office Moving',
  category: 'logistics',
  description: 'Office Moving platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "office moving",
      "office",
      "moving",
      "office software",
      "office app",
      "office platform",
      "office system",
      "office management",
      "services office"
  ],

  synonyms: [
      "Office Moving platform",
      "Office Moving software",
      "Office Moving system",
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
      "reservations",
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "contracts",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a office moving platform",
      "Create a office moving app",
      "I need a office moving management system",
      "Build a office moving solution",
      "Create a office moving booking system"
  ],
};
