/**
 * Tax Planning App Type Definition
 *
 * Complete definition for tax planning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TAX_PLANNING_APP_TYPE: AppTypeDefinition = {
  id: 'tax-planning',
  name: 'Tax Planning',
  category: 'services',
  description: 'Tax Planning platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tax planning",
      "tax",
      "planning",
      "tax software",
      "tax app",
      "tax platform",
      "tax system",
      "tax management",
      "services tax"
  ],

  synonyms: [
      "Tax Planning platform",
      "Tax Planning software",
      "Tax Planning system",
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
      "Build a tax planning platform",
      "Create a tax planning app",
      "I need a tax planning management system",
      "Build a tax planning solution",
      "Create a tax planning booking system"
  ],
};
