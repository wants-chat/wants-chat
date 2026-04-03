/**
 * Asset Recovery App Type Definition
 *
 * Complete definition for asset recovery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASSET_RECOVERY_APP_TYPE: AppTypeDefinition = {
  id: 'asset-recovery',
  name: 'Asset Recovery',
  category: 'services',
  description: 'Asset Recovery platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "asset recovery",
      "asset",
      "recovery",
      "asset software",
      "asset app",
      "asset platform",
      "asset system",
      "asset management",
      "services asset"
  ],

  synonyms: [
      "Asset Recovery platform",
      "Asset Recovery software",
      "Asset Recovery system",
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
      "Build a asset recovery platform",
      "Create a asset recovery app",
      "I need a asset recovery management system",
      "Build a asset recovery solution",
      "Create a asset recovery booking system"
  ],
};
