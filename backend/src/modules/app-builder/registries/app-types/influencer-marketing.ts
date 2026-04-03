/**
 * Influencer Marketing App Type Definition
 *
 * Complete definition for influencer marketing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INFLUENCER_MARKETING_APP_TYPE: AppTypeDefinition = {
  id: 'influencer-marketing',
  name: 'Influencer Marketing',
  category: 'retail',
  description: 'Influencer Marketing platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "influencer marketing",
      "influencer",
      "marketing",
      "influencer software",
      "influencer app",
      "influencer platform",
      "influencer system",
      "influencer management",
      "retail influencer"
  ],

  synonyms: [
      "Influencer Marketing platform",
      "Influencer Marketing software",
      "Influencer Marketing system",
      "influencer solution",
      "influencer service"
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
      "Build a influencer marketing platform",
      "Create a influencer marketing app",
      "I need a influencer marketing management system",
      "Build a influencer marketing solution",
      "Create a influencer marketing booking system"
  ],
};
