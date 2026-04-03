/**
 * Six Sigma App Type Definition
 *
 * Complete definition for six sigma applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SIX_SIGMA_APP_TYPE: AppTypeDefinition = {
  id: 'six-sigma',
  name: 'Six Sigma',
  category: 'services',
  description: 'Six Sigma platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "six sigma",
      "six",
      "sigma",
      "six software",
      "six app",
      "six platform",
      "six system",
      "six management",
      "services six"
  ],

  synonyms: [
      "Six Sigma platform",
      "Six Sigma software",
      "Six Sigma system",
      "six solution",
      "six service"
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
      "Build a six sigma platform",
      "Create a six sigma app",
      "I need a six sigma management system",
      "Build a six sigma solution",
      "Create a six sigma booking system"
  ],
};
