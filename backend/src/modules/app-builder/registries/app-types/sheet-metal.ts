/**
 * Sheet Metal App Type Definition
 *
 * Complete definition for sheet metal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHEET_METAL_APP_TYPE: AppTypeDefinition = {
  id: 'sheet-metal',
  name: 'Sheet Metal',
  category: 'services',
  description: 'Sheet Metal platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sheet metal",
      "sheet",
      "metal",
      "sheet software",
      "sheet app",
      "sheet platform",
      "sheet system",
      "sheet management",
      "services sheet"
  ],

  synonyms: [
      "Sheet Metal platform",
      "Sheet Metal software",
      "Sheet Metal system",
      "sheet solution",
      "sheet service"
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
      "Build a sheet metal platform",
      "Create a sheet metal app",
      "I need a sheet metal management system",
      "Build a sheet metal solution",
      "Create a sheet metal booking system"
  ],
};
