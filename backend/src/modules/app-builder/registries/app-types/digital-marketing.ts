/**
 * Digital Marketing App Type Definition
 *
 * Complete definition for digital marketing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DIGITAL_MARKETING_APP_TYPE: AppTypeDefinition = {
  id: 'digital-marketing',
  name: 'Digital Marketing',
  category: 'retail',
  description: 'Digital Marketing platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "digital marketing",
      "digital",
      "marketing",
      "digital software",
      "digital app",
      "digital platform",
      "digital system",
      "digital management",
      "retail digital"
  ],

  synonyms: [
      "Digital Marketing platform",
      "Digital Marketing software",
      "Digital Marketing system",
      "digital solution",
      "digital service"
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
      "Build a digital marketing platform",
      "Create a digital marketing app",
      "I need a digital marketing management system",
      "Build a digital marketing solution",
      "Create a digital marketing booking system"
  ],
};
