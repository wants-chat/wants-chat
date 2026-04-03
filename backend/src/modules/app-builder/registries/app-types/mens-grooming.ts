/**
 * Mens Grooming App Type Definition
 *
 * Complete definition for mens grooming applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MENS_GROOMING_APP_TYPE: AppTypeDefinition = {
  id: 'mens-grooming',
  name: 'Mens Grooming',
  category: 'pets',
  description: 'Mens Grooming platform with comprehensive management features',
  icon: 'scissors',

  keywords: [
      "mens grooming",
      "mens",
      "grooming",
      "mens software",
      "mens app",
      "mens platform",
      "mens system",
      "mens management",
      "pets mens"
  ],

  synonyms: [
      "Mens Grooming platform",
      "Mens Grooming software",
      "Mens Grooming system",
      "mens solution",
      "mens service"
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
      "pos-system",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "gallery",
      "subscriptions",
      "reminders"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'simple',
  industry: 'pets',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'playful',

  examplePrompts: [
      "Build a mens grooming platform",
      "Create a mens grooming app",
      "I need a mens grooming management system",
      "Build a mens grooming solution",
      "Create a mens grooming booking system"
  ],
};
