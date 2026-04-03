/**
 * Zip Lining App Type Definition
 *
 * Complete definition for zip lining applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ZIP_LINING_APP_TYPE: AppTypeDefinition = {
  id: 'zip-lining',
  name: 'Zip Lining',
  category: 'services',
  description: 'Zip Lining platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "zip lining",
      "zip",
      "lining",
      "zip software",
      "zip app",
      "zip platform",
      "zip system",
      "zip management",
      "services zip"
  ],

  synonyms: [
      "Zip Lining platform",
      "Zip Lining software",
      "Zip Lining system",
      "zip solution",
      "zip service"
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
      "Build a zip lining platform",
      "Create a zip lining app",
      "I need a zip lining management system",
      "Build a zip lining solution",
      "Create a zip lining booking system"
  ],
};
