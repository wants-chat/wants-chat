/**
 * Tire Sales App Type Definition
 *
 * Complete definition for tire sales applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TIRE_SALES_APP_TYPE: AppTypeDefinition = {
  id: 'tire-sales',
  name: 'Tire Sales',
  category: 'automotive',
  description: 'Tire Sales platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "tire sales",
      "tire",
      "sales",
      "tire software",
      "tire app",
      "tire platform",
      "tire system",
      "tire management",
      "automotive tire"
  ],

  synonyms: [
      "Tire Sales platform",
      "Tire Sales software",
      "Tire Sales system",
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
      "Build a tire sales platform",
      "Create a tire sales app",
      "I need a tire sales management system",
      "Build a tire sales solution",
      "Create a tire sales booking system"
  ],
};
