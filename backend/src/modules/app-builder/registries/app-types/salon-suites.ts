/**
 * Salon Suites App Type Definition
 *
 * Complete definition for salon suites applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SALON_SUITES_APP_TYPE: AppTypeDefinition = {
  id: 'salon-suites',
  name: 'Salon Suites',
  category: 'beauty',
  description: 'Salon Suites platform with comprehensive management features',
  icon: 'scissors',

  keywords: [
      "salon suites",
      "salon",
      "suites",
      "salon software",
      "salon app",
      "salon platform",
      "salon system",
      "salon management",
      "beauty salon"
  ],

  synonyms: [
      "Salon Suites platform",
      "Salon Suites software",
      "Salon Suites system",
      "salon solution",
      "salon service"
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
      "team-management",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'beauty',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a salon suites platform",
      "Create a salon suites app",
      "I need a salon suites management system",
      "Build a salon suites solution",
      "Create a salon suites booking system"
  ],
};
