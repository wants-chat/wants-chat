/**
 * Cannabis Dispensary App Type Definition
 *
 * Complete definition for cannabis dispensary applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CANNABIS_DISPENSARY_APP_TYPE: AppTypeDefinition = {
  id: 'cannabis-dispensary',
  name: 'Cannabis Dispensary',
  category: 'services',
  description: 'Cannabis Dispensary platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "cannabis dispensary",
      "cannabis",
      "dispensary",
      "cannabis software",
      "cannabis app",
      "cannabis platform",
      "cannabis system",
      "cannabis management",
      "services cannabis"
  ],

  synonyms: [
      "Cannabis Dispensary platform",
      "Cannabis Dispensary software",
      "Cannabis Dispensary system",
      "cannabis solution",
      "cannabis service"
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
      "Build a cannabis dispensary platform",
      "Create a cannabis dispensary app",
      "I need a cannabis dispensary management system",
      "Build a cannabis dispensary solution",
      "Create a cannabis dispensary booking system"
  ],
};
