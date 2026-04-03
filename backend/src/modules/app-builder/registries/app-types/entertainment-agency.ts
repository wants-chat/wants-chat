/**
 * Entertainment Agency App Type Definition
 *
 * Complete definition for entertainment agency applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ENTERTAINMENT_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'entertainment-agency',
  name: 'Entertainment Agency',
  category: 'entertainment',
  description: 'Entertainment Agency platform with comprehensive management features',
  icon: 'ticket',

  keywords: [
      "entertainment agency",
      "entertainment",
      "agency",
      "entertainment software",
      "entertainment app",
      "entertainment platform",
      "entertainment system",
      "entertainment management",
      "entertainment entertainment"
  ],

  synonyms: [
      "Entertainment Agency platform",
      "Entertainment Agency software",
      "Entertainment Agency system",
      "entertainment solution",
      "entertainment service"
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
      "ticket-sales",
      "venue-booking",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "seating-charts",
      "payments",
      "reviews",
      "gallery",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'vibrant',

  examplePrompts: [
      "Build a entertainment agency platform",
      "Create a entertainment agency app",
      "I need a entertainment agency management system",
      "Build a entertainment agency solution",
      "Create a entertainment agency booking system"
  ],
};
