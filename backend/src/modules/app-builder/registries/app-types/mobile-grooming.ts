/**
 * Mobile Grooming App Type Definition
 *
 * Complete definition for mobile grooming applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILE_GROOMING_APP_TYPE: AppTypeDefinition = {
  id: 'mobile-grooming',
  name: 'Mobile Grooming',
  category: 'pets',
  description: 'Mobile Grooming platform with comprehensive management features',
  icon: 'scissors',

  keywords: [
      "mobile grooming",
      "mobile",
      "grooming",
      "mobile software",
      "mobile app",
      "mobile platform",
      "mobile system",
      "mobile management",
      "pets mobile"
  ],

  synonyms: [
      "Mobile Grooming platform",
      "Mobile Grooming software",
      "Mobile Grooming system",
      "mobile solution",
      "mobile service"
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
      "Build a mobile grooming platform",
      "Create a mobile grooming app",
      "I need a mobile grooming management system",
      "Build a mobile grooming solution",
      "Create a mobile grooming booking system"
  ],
};
