/**
 * Watch Repair App Type Definition
 *
 * Complete definition for watch repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATCH_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'watch-repair',
  name: 'Watch Repair',
  category: 'services',
  description: 'Watch Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "watch repair",
      "watch",
      "repair",
      "watch software",
      "watch app",
      "watch platform",
      "watch system",
      "watch management",
      "services watch"
  ],

  synonyms: [
      "Watch Repair platform",
      "Watch Repair software",
      "Watch Repair system",
      "watch solution",
      "watch service"
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
      "Build a watch repair platform",
      "Create a watch repair app",
      "I need a watch repair management system",
      "Build a watch repair solution",
      "Create a watch repair booking system"
  ],
};
