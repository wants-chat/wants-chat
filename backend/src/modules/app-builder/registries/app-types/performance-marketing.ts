/**
 * Performance Marketing App Type Definition
 *
 * Complete definition for performance marketing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PERFORMANCE_MARKETING_APP_TYPE: AppTypeDefinition = {
  id: 'performance-marketing',
  name: 'Performance Marketing',
  category: 'retail',
  description: 'Performance Marketing platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "performance marketing",
      "performance",
      "marketing",
      "performance software",
      "performance app",
      "performance platform",
      "performance system",
      "performance management",
      "retail performance"
  ],

  synonyms: [
      "Performance Marketing platform",
      "Performance Marketing software",
      "Performance Marketing system",
      "performance solution",
      "performance service"
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
      "Build a performance marketing platform",
      "Create a performance marketing app",
      "I need a performance marketing management system",
      "Build a performance marketing solution",
      "Create a performance marketing booking system"
  ],
};
