/**
 * Tea Room App Type Definition
 *
 * Complete definition for tea room applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEA_ROOM_APP_TYPE: AppTypeDefinition = {
  id: 'tea-room',
  name: 'Tea Room',
  category: 'services',
  description: 'Tea Room platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tea room",
      "tea",
      "room",
      "tea software",
      "tea app",
      "tea platform",
      "tea system",
      "tea management",
      "services tea"
  ],

  synonyms: [
      "Tea Room platform",
      "Tea Room software",
      "Tea Room system",
      "tea solution",
      "tea service"
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
      "Build a tea room platform",
      "Create a tea room app",
      "I need a tea room management system",
      "Build a tea room solution",
      "Create a tea room booking system"
  ],
};
