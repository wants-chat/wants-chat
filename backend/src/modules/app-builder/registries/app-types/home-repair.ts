/**
 * Home Repair App Type Definition
 *
 * Complete definition for home repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOME_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'home-repair',
  name: 'Home Repair',
  category: 'services',
  description: 'Home Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "home repair",
      "home",
      "repair",
      "home software",
      "home app",
      "home platform",
      "home system",
      "home management",
      "services home"
  ],

  synonyms: [
      "Home Repair platform",
      "Home Repair software",
      "Home Repair system",
      "home solution",
      "home service"
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
      "Build a home repair platform",
      "Create a home repair app",
      "I need a home repair management system",
      "Build a home repair solution",
      "Create a home repair booking system"
  ],
};
