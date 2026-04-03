/**
 * Mri Center App Type Definition
 *
 * Complete definition for mri center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MRI_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'mri-center',
  name: 'Mri Center',
  category: 'services',
  description: 'Mri Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "mri center",
      "mri",
      "center",
      "mri software",
      "mri app",
      "mri platform",
      "mri system",
      "mri management",
      "services mri"
  ],

  synonyms: [
      "Mri Center platform",
      "Mri Center software",
      "Mri Center system",
      "mri solution",
      "mri service"
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
      "Build a mri center platform",
      "Create a mri center app",
      "I need a mri center management system",
      "Build a mri center solution",
      "Create a mri center booking system"
  ],
};
