/**
 * Gift Basket App Type Definition
 *
 * Complete definition for gift basket applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GIFT_BASKET_APP_TYPE: AppTypeDefinition = {
  id: 'gift-basket',
  name: 'Gift Basket',
  category: 'services',
  description: 'Gift Basket platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "gift basket",
      "gift",
      "basket",
      "gift software",
      "gift app",
      "gift platform",
      "gift system",
      "gift management",
      "services gift"
  ],

  synonyms: [
      "Gift Basket platform",
      "Gift Basket software",
      "Gift Basket system",
      "gift solution",
      "gift service"
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
      "Build a gift basket platform",
      "Create a gift basket app",
      "I need a gift basket management system",
      "Build a gift basket solution",
      "Create a gift basket booking system"
  ],
};
