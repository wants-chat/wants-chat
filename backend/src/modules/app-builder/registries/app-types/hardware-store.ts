/**
 * Hardware Store App Type Definition
 *
 * Complete definition for hardware store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HARDWARE_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'hardware-store',
  name: 'Hardware Store',
  category: 'retail',
  description: 'Hardware Store platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "hardware store",
      "hardware",
      "store",
      "hardware software",
      "hardware app",
      "hardware platform",
      "hardware system",
      "hardware management",
      "retail hardware"
  ],

  synonyms: [
      "Hardware Store platform",
      "Hardware Store software",
      "Hardware Store system",
      "hardware solution",
      "hardware service"
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
      "product-catalog",
      "inventory",
      "pos-system",
      "orders",
      "notifications"
  ],

  optionalFeatures: [
      "shopping-cart",
      "checkout",
      "payments",
      "discounts",
      "reviews"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'retail',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a hardware store platform",
      "Create a hardware store app",
      "I need a hardware store management system",
      "Build a hardware store solution",
      "Create a hardware store booking system"
  ],
};
