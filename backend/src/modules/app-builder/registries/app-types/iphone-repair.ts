/**
 * Iphone Repair App Type Definition
 *
 * Complete definition for iphone repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const IPHONE_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'iphone-repair',
  name: 'Iphone Repair',
  category: 'services',
  description: 'Iphone Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "iphone repair",
      "iphone",
      "repair",
      "iphone software",
      "iphone app",
      "iphone platform",
      "iphone system",
      "iphone management",
      "services iphone"
  ],

  synonyms: [
      "Iphone Repair platform",
      "Iphone Repair software",
      "Iphone Repair system",
      "iphone solution",
      "iphone service"
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
      "Build a iphone repair platform",
      "Create a iphone repair app",
      "I need a iphone repair management system",
      "Build a iphone repair solution",
      "Create a iphone repair booking system"
  ],
};
