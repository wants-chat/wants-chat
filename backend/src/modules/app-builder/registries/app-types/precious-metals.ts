/**
 * Precious Metals App Type Definition
 *
 * Complete definition for precious metals applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRECIOUS_METALS_APP_TYPE: AppTypeDefinition = {
  id: 'precious-metals',
  name: 'Precious Metals',
  category: 'services',
  description: 'Precious Metals platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "precious metals",
      "precious",
      "metals",
      "precious software",
      "precious app",
      "precious platform",
      "precious system",
      "precious management",
      "services precious"
  ],

  synonyms: [
      "Precious Metals platform",
      "Precious Metals software",
      "Precious Metals system",
      "precious solution",
      "precious service"
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
      "Build a precious metals platform",
      "Create a precious metals app",
      "I need a precious metals management system",
      "Build a precious metals solution",
      "Create a precious metals booking system"
  ],
};
