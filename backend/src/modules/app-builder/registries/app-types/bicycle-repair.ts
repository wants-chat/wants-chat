/**
 * Bicycle Repair App Type Definition
 *
 * Complete definition for bicycle repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BICYCLE_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'bicycle-repair',
  name: 'Bicycle Repair',
  category: 'services',
  description: 'Bicycle Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "bicycle repair",
      "bicycle",
      "repair",
      "bicycle software",
      "bicycle app",
      "bicycle platform",
      "bicycle system",
      "bicycle management",
      "services bicycle"
  ],

  synonyms: [
      "Bicycle Repair platform",
      "Bicycle Repair software",
      "Bicycle Repair system",
      "bicycle solution",
      "bicycle service"
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
      "Build a bicycle repair platform",
      "Create a bicycle repair app",
      "I need a bicycle repair management system",
      "Build a bicycle repair solution",
      "Create a bicycle repair booking system"
  ],
};
