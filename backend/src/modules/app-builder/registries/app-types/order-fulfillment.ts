/**
 * Order Fulfillment App Type Definition
 *
 * Complete definition for order fulfillment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ORDER_FULFILLMENT_APP_TYPE: AppTypeDefinition = {
  id: 'order-fulfillment',
  name: 'Order Fulfillment',
  category: 'services',
  description: 'Order Fulfillment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "order fulfillment",
      "order",
      "fulfillment",
      "order software",
      "order app",
      "order platform",
      "order system",
      "order management",
      "services order"
  ],

  synonyms: [
      "Order Fulfillment platform",
      "Order Fulfillment software",
      "Order Fulfillment system",
      "order solution",
      "order service"
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
      "Build a order fulfillment platform",
      "Create a order fulfillment app",
      "I need a order fulfillment management system",
      "Build a order fulfillment solution",
      "Create a order fulfillment booking system"
  ],
};
