/**
 * Air Conditioning Repair App Type Definition
 *
 * Complete definition for air conditioning repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIR_CONDITIONING_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'air-conditioning-repair',
  name: 'Air Conditioning Repair',
  category: 'services',
  description: 'Air Conditioning Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "air conditioning repair",
      "air",
      "conditioning",
      "repair",
      "air software",
      "air app",
      "air platform",
      "air system",
      "air management",
      "services air"
  ],

  synonyms: [
      "Air Conditioning Repair platform",
      "Air Conditioning Repair software",
      "Air Conditioning Repair system",
      "air solution",
      "air service"
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
      "Build a air conditioning repair platform",
      "Create a air conditioning repair app",
      "I need a air conditioning repair management system",
      "Build a air conditioning repair solution",
      "Create a air conditioning repair booking system"
  ],
};
