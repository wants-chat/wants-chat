/**
 * Glass Repair App Type Definition
 *
 * Complete definition for glass repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GLASS_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'glass-repair',
  name: 'Glass Repair',
  category: 'services',
  description: 'Glass Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "glass repair",
      "glass",
      "repair",
      "glass software",
      "glass app",
      "glass platform",
      "glass system",
      "glass management",
      "services glass"
  ],

  synonyms: [
      "Glass Repair platform",
      "Glass Repair software",
      "Glass Repair system",
      "glass solution",
      "glass service"
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
      "Build a glass repair platform",
      "Create a glass repair app",
      "I need a glass repair management system",
      "Build a glass repair solution",
      "Create a glass repair booking system"
  ],
};
