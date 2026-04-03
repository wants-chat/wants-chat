/**
 * Metal Roofing App Type Definition
 *
 * Complete definition for metal roofing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const METAL_ROOFING_APP_TYPE: AppTypeDefinition = {
  id: 'metal-roofing',
  name: 'Metal Roofing',
  category: 'construction',
  description: 'Metal Roofing platform with comprehensive management features',
  icon: 'house',

  keywords: [
      "metal roofing",
      "metal",
      "roofing",
      "metal software",
      "metal app",
      "metal platform",
      "metal system",
      "metal management",
      "trades metal"
  ],

  synonyms: [
      "Metal Roofing platform",
      "Metal Roofing software",
      "Metal Roofing system",
      "metal solution",
      "metal service"
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
      "project-bids",
      "scheduling",
      "invoicing",
      "clients",
      "notifications"
  ],

  optionalFeatures: [
      "documents",
      "payments",
      "reviews",
      "gallery",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'trades',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a metal roofing platform",
      "Create a metal roofing app",
      "I need a metal roofing management system",
      "Build a metal roofing solution",
      "Create a metal roofing booking system"
  ],
};
