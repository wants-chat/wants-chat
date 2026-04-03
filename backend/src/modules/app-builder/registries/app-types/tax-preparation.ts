/**
 * Tax Preparation App Type Definition
 *
 * Complete definition for tax preparation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TAX_PREPARATION_APP_TYPE: AppTypeDefinition = {
  id: 'tax-preparation',
  name: 'Tax Preparation',
  category: 'services',
  description: 'Tax Preparation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tax preparation",
      "tax",
      "preparation",
      "tax software",
      "tax app",
      "tax platform",
      "tax system",
      "tax management",
      "services tax"
  ],

  synonyms: [
      "Tax Preparation platform",
      "Tax Preparation software",
      "Tax Preparation system",
      "tax solution",
      "tax service"
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
      "Build a tax preparation platform",
      "Create a tax preparation app",
      "I need a tax preparation management system",
      "Build a tax preparation solution",
      "Create a tax preparation booking system"
  ],
};
