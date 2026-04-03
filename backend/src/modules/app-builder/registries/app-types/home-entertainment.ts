/**
 * Home Entertainment App Type Definition
 *
 * Complete definition for home entertainment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOME_ENTERTAINMENT_APP_TYPE: AppTypeDefinition = {
  id: 'home-entertainment',
  name: 'Home Entertainment',
  category: 'entertainment',
  description: 'Home Entertainment platform with comprehensive management features',
  icon: 'ticket',

  keywords: [
      "home entertainment",
      "home",
      "entertainment",
      "home software",
      "home app",
      "home platform",
      "home system",
      "home management",
      "entertainment home"
  ],

  synonyms: [
      "Home Entertainment platform",
      "Home Entertainment software",
      "Home Entertainment system",
      "home solution",
      "home service"
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
      "Build a home entertainment platform",
      "Create a home entertainment app",
      "I need a home entertainment management system",
      "Build a home entertainment solution",
      "Create a home entertainment booking system"
  ],
};
