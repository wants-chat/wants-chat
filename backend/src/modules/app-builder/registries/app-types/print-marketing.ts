/**
 * Print Marketing App Type Definition
 *
 * Complete definition for print marketing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRINT_MARKETING_APP_TYPE: AppTypeDefinition = {
  id: 'print-marketing',
  name: 'Print Marketing',
  category: 'retail',
  description: 'Print Marketing platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "print marketing",
      "print",
      "marketing",
      "print software",
      "print app",
      "print platform",
      "print system",
      "print management",
      "retail print"
  ],

  synonyms: [
      "Print Marketing platform",
      "Print Marketing software",
      "Print Marketing system",
      "print solution",
      "print service"
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
      "product-catalog",
      "orders",
      "pos-system",
      "inventory",
      "notifications"
  ],

  optionalFeatures: [
      "payments",
      "discounts",
      "reviews",
      "analytics",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'retail',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a print marketing platform",
      "Create a print marketing app",
      "I need a print marketing management system",
      "Build a print marketing solution",
      "Create a print marketing booking system"
  ],
};
