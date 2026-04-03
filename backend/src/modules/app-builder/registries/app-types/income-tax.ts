/**
 * Income Tax App Type Definition
 *
 * Complete definition for income tax applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INCOME_TAX_APP_TYPE: AppTypeDefinition = {
  id: 'income-tax',
  name: 'Income Tax',
  category: 'services',
  description: 'Income Tax platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "income tax",
      "income",
      "tax",
      "income software",
      "income app",
      "income platform",
      "income system",
      "income management",
      "services income"
  ],

  synonyms: [
      "Income Tax platform",
      "Income Tax software",
      "Income Tax system",
      "income solution",
      "income service"
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
      "Build a income tax platform",
      "Create a income tax app",
      "I need a income tax management system",
      "Build a income tax solution",
      "Create a income tax booking system"
  ],
};
