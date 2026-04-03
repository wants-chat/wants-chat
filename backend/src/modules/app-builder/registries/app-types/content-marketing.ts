/**
 * Content Marketing App Type Definition
 *
 * Complete definition for content marketing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CONTENT_MARKETING_APP_TYPE: AppTypeDefinition = {
  id: 'content-marketing',
  name: 'Content Marketing',
  category: 'retail',
  description: 'Content Marketing platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "content marketing",
      "content",
      "marketing",
      "content software",
      "content app",
      "content platform",
      "content system",
      "content management",
      "retail content"
  ],

  synonyms: [
      "Content Marketing platform",
      "Content Marketing software",
      "Content Marketing system",
      "content solution",
      "content service"
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
      "Build a content marketing platform",
      "Create a content marketing app",
      "I need a content marketing management system",
      "Build a content marketing solution",
      "Create a content marketing booking system"
  ],
};
