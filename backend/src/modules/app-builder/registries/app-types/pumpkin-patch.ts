/**
 * Pumpkin Patch App Type Definition
 *
 * Complete definition for pumpkin patch applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PUMPKIN_PATCH_APP_TYPE: AppTypeDefinition = {
  id: 'pumpkin-patch',
  name: 'Pumpkin Patch',
  category: 'services',
  description: 'Pumpkin Patch platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "pumpkin patch",
      "pumpkin",
      "patch",
      "pumpkin software",
      "pumpkin app",
      "pumpkin platform",
      "pumpkin system",
      "pumpkin management",
      "services pumpkin"
  ],

  synonyms: [
      "Pumpkin Patch platform",
      "Pumpkin Patch software",
      "Pumpkin Patch system",
      "pumpkin solution",
      "pumpkin service"
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
      "Build a pumpkin patch platform",
      "Create a pumpkin patch app",
      "I need a pumpkin patch management system",
      "Build a pumpkin patch solution",
      "Create a pumpkin patch booking system"
  ],
};
