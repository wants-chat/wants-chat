/**
 * Public Accounting App Type Definition
 *
 * Complete definition for public accounting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PUBLIC_ACCOUNTING_APP_TYPE: AppTypeDefinition = {
  id: 'public-accounting',
  name: 'Public Accounting',
  category: 'finance',
  description: 'Public Accounting platform with comprehensive management features',
  icon: 'calculator',

  keywords: [
      "public accounting",
      "public",
      "accounting",
      "public software",
      "public app",
      "public platform",
      "public system",
      "public management",
      "finance public"
  ],

  synonyms: [
      "Public Accounting platform",
      "Public Accounting software",
      "Public Accounting system",
      "public solution",
      "public service"
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
      "Build a public accounting platform",
      "Create a public accounting app",
      "I need a public accounting management system",
      "Build a public accounting solution",
      "Create a public accounting booking system"
  ],
};
