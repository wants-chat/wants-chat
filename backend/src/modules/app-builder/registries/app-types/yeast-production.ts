/**
 * Yeast Production App Type Definition
 *
 * Complete definition for yeast production applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YEAST_PRODUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'yeast-production',
  name: 'Yeast Production',
  category: 'services',
  description: 'Yeast Production platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "yeast production",
      "yeast",
      "production",
      "yeast software",
      "yeast app",
      "yeast platform",
      "yeast system",
      "yeast management",
      "services yeast"
  ],

  synonyms: [
      "Yeast Production platform",
      "Yeast Production software",
      "Yeast Production system",
      "yeast solution",
      "yeast service"
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
      "Build a yeast production platform",
      "Create a yeast production app",
      "I need a yeast production management system",
      "Build a yeast production solution",
      "Create a yeast production booking system"
  ],
};
