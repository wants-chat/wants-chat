/**
 * Subscription Services App Type Definition
 *
 * Complete definition for subscription services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUBSCRIPTION_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'subscription-services',
  name: 'Subscription Services',
  category: 'services',
  description: 'Subscription Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "subscription services",
      "subscription",
      "services",
      "subscription software",
      "subscription app",
      "subscription platform",
      "subscription system",
      "subscription management",
      "services subscription"
  ],

  synonyms: [
      "Subscription Services platform",
      "Subscription Services software",
      "Subscription Services system",
      "subscription solution",
      "subscription service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a subscription services platform",
      "Create a subscription services app",
      "I need a subscription services management system",
      "Build a subscription services solution",
      "Create a subscription services booking system"
  ],
};
