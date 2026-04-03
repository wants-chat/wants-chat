/**
 * Asset Protection App Type Definition
 *
 * Complete definition for asset protection applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASSET_PROTECTION_APP_TYPE: AppTypeDefinition = {
  id: 'asset-protection',
  name: 'Asset Protection',
  category: 'services',
  description: 'Asset Protection platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "asset protection",
      "asset",
      "protection",
      "asset software",
      "asset app",
      "asset platform",
      "asset system",
      "asset management",
      "services asset"
  ],

  synonyms: [
      "Asset Protection platform",
      "Asset Protection software",
      "Asset Protection system",
      "asset solution",
      "asset service"
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
      "Build a asset protection platform",
      "Create a asset protection app",
      "I need a asset protection management system",
      "Build a asset protection solution",
      "Create a asset protection booking system"
  ],
};
