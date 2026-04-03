/**
 * Tax Return App Type Definition
 *
 * Complete definition for tax return applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TAX_RETURN_APP_TYPE: AppTypeDefinition = {
  id: 'tax-return',
  name: 'Tax Return',
  category: 'services',
  description: 'Tax Return platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tax return",
      "tax",
      "return",
      "tax software",
      "tax app",
      "tax platform",
      "tax system",
      "tax management",
      "services tax"
  ],

  synonyms: [
      "Tax Return platform",
      "Tax Return software",
      "Tax Return system",
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
      "Build a tax return platform",
      "Create a tax return app",
      "I need a tax return management system",
      "Build a tax return solution",
      "Create a tax return booking system"
  ],
};
