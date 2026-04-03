/**
 * Roof Repair App Type Definition
 *
 * Complete definition for roof repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ROOF_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'roof-repair',
  name: 'Roof Repair',
  category: 'services',
  description: 'Roof Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "roof repair",
      "roof",
      "repair",
      "roof software",
      "roof app",
      "roof platform",
      "roof system",
      "roof management",
      "services roof"
  ],

  synonyms: [
      "Roof Repair platform",
      "Roof Repair software",
      "Roof Repair system",
      "roof solution",
      "roof service"
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
      "Build a roof repair platform",
      "Create a roof repair app",
      "I need a roof repair management system",
      "Build a roof repair solution",
      "Create a roof repair booking system"
  ],
};
