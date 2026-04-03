/**
 * Internet Marketing App Type Definition
 *
 * Complete definition for internet marketing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INTERNET_MARKETING_APP_TYPE: AppTypeDefinition = {
  id: 'internet-marketing',
  name: 'Internet Marketing',
  category: 'retail',
  description: 'Internet Marketing platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "internet marketing",
      "internet",
      "marketing",
      "internet software",
      "internet app",
      "internet platform",
      "internet system",
      "internet management",
      "retail internet"
  ],

  synonyms: [
      "Internet Marketing platform",
      "Internet Marketing software",
      "Internet Marketing system",
      "internet solution",
      "internet service"
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
      "Build a internet marketing platform",
      "Create a internet marketing app",
      "I need a internet marketing management system",
      "Build a internet marketing solution",
      "Create a internet marketing booking system"
  ],
};
