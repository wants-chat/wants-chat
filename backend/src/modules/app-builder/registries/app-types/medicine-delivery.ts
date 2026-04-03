/**
 * Medicine Delivery App Type Definition
 *
 * Complete definition for medicine delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEDICINE_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'medicine-delivery',
  name: 'Medicine Delivery',
  category: 'logistics',
  description: 'Medicine Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "medicine delivery",
      "medicine",
      "delivery",
      "medicine software",
      "medicine app",
      "medicine platform",
      "medicine system",
      "medicine management",
      "logistics medicine"
  ],

  synonyms: [
      "Medicine Delivery platform",
      "Medicine Delivery software",
      "Medicine Delivery system",
      "medicine solution",
      "medicine service"
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
      "orders",
      "route-optimization",
      "fleet-tracking",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "proof-of-delivery",
      "payments",
      "reviews",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'logistics',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a medicine delivery platform",
      "Create a medicine delivery app",
      "I need a medicine delivery management system",
      "Build a medicine delivery solution",
      "Create a medicine delivery booking system"
  ],
};
