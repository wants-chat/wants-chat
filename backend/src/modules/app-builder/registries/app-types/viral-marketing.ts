/**
 * Viral Marketing App Type Definition
 *
 * Complete definition for viral marketing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIRAL_MARKETING_APP_TYPE: AppTypeDefinition = {
  id: 'viral-marketing',
  name: 'Viral Marketing',
  category: 'retail',
  description: 'Viral Marketing platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "viral marketing",
      "viral",
      "marketing",
      "viral software",
      "viral app",
      "viral platform",
      "viral system",
      "viral management",
      "retail viral"
  ],

  synonyms: [
      "Viral Marketing platform",
      "Viral Marketing software",
      "Viral Marketing system",
      "viral solution",
      "viral service"
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
      "Build a viral marketing platform",
      "Create a viral marketing app",
      "I need a viral marketing management system",
      "Build a viral marketing solution",
      "Create a viral marketing booking system"
  ],
};
