/**
 * Wheel Repair App Type Definition
 *
 * Complete definition for wheel repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHEEL_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'wheel-repair',
  name: 'Wheel Repair',
  category: 'services',
  description: 'Wheel Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "wheel repair",
      "wheel",
      "repair",
      "wheel software",
      "wheel app",
      "wheel platform",
      "wheel system",
      "wheel management",
      "services wheel"
  ],

  synonyms: [
      "Wheel Repair platform",
      "Wheel Repair software",
      "Wheel Repair system",
      "wheel solution",
      "wheel service"
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
      "Build a wheel repair platform",
      "Create a wheel repair app",
      "I need a wheel repair management system",
      "Build a wheel repair solution",
      "Create a wheel repair booking system"
  ],
};
