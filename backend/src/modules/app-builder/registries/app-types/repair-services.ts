/**
 * Repair Services App Type Definition
 *
 * Complete definition for repair services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REPAIR_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'repair-services',
  name: 'Repair Services',
  category: 'services',
  description: 'Repair Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "repair services",
      "repair",
      "services",
      "repair software",
      "repair app",
      "repair platform",
      "repair system",
      "repair management",
      "services repair"
  ],

  synonyms: [
      "Repair Services platform",
      "Repair Services software",
      "Repair Services system",
      "repair solution",
      "repair service"
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
      "Build a repair services platform",
      "Create a repair services app",
      "I need a repair services management system",
      "Build a repair services solution",
      "Create a repair services booking system"
  ],
};
