/**
 * Tire Rotation App Type Definition
 *
 * Complete definition for tire rotation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TIRE_ROTATION_APP_TYPE: AppTypeDefinition = {
  id: 'tire-rotation',
  name: 'Tire Rotation',
  category: 'automotive',
  description: 'Tire Rotation platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "tire rotation",
      "tire",
      "rotation",
      "tire software",
      "tire app",
      "tire platform",
      "tire system",
      "tire management",
      "automotive tire"
  ],

  synonyms: [
      "Tire Rotation platform",
      "Tire Rotation software",
      "Tire Rotation system",
      "tire solution",
      "tire service"
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
      "vehicle-inventory",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "service-scheduling",
      "parts-catalog",
      "invoicing",
      "payments",
      "reviews"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a tire rotation platform",
      "Create a tire rotation app",
      "I need a tire rotation management system",
      "Build a tire rotation solution",
      "Create a tire rotation booking system"
  ],
};
