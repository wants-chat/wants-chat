/**
 * Tax Accounting App Type Definition
 *
 * Complete definition for tax accounting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TAX_ACCOUNTING_APP_TYPE: AppTypeDefinition = {
  id: 'tax-accounting',
  name: 'Tax Accounting',
  category: 'finance',
  description: 'Tax Accounting platform with comprehensive management features',
  icon: 'calculator',

  keywords: [
      "tax accounting",
      "tax",
      "accounting",
      "tax software",
      "tax app",
      "tax platform",
      "tax system",
      "tax management",
      "finance tax"
  ],

  synonyms: [
      "Tax Accounting platform",
      "Tax Accounting software",
      "Tax Accounting system",
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
      "clients",
      "invoicing",
      "documents",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "reporting",
      "payments",
      "time-tracking",
      "contracts",
      "tasks"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'finance',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a tax accounting platform",
      "Create a tax accounting app",
      "I need a tax accounting management system",
      "Build a tax accounting solution",
      "Create a tax accounting booking system"
  ],
};
