/**
 * Online Marketplace App Type Definition
 *
 * Complete definition for online marketplace applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_MARKETPLACE_APP_TYPE: AppTypeDefinition = {
  id: 'online-marketplace',
  name: 'Online Marketplace',
  category: 'retail',
  description: 'Online Marketplace platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "online marketplace",
      "online",
      "marketplace",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "retail online"
  ],

  synonyms: [
      "Online Marketplace platform",
      "Online Marketplace software",
      "Online Marketplace system",
      "online solution",
      "online service"
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
      "Build a online marketplace platform",
      "Create a online marketplace app",
      "I need a online marketplace management system",
      "Build a online marketplace solution",
      "Create a online marketplace booking system"
  ],
};
