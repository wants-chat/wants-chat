/**
 * Linen Supply App Type Definition
 *
 * Complete definition for linen supply applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LINEN_SUPPLY_APP_TYPE: AppTypeDefinition = {
  id: 'linen-supply',
  name: 'Linen Supply',
  category: 'services',
  description: 'Linen Supply platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "linen supply",
      "linen",
      "supply",
      "linen software",
      "linen app",
      "linen platform",
      "linen system",
      "linen management",
      "services linen"
  ],

  synonyms: [
      "Linen Supply platform",
      "Linen Supply software",
      "Linen Supply system",
      "linen solution",
      "linen service"
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a linen supply platform",
      "Create a linen supply app",
      "I need a linen supply management system",
      "Build a linen supply solution",
      "Create a linen supply booking system"
  ],
};
