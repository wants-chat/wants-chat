/**
 * Turkey Farm App Type Definition
 *
 * Complete definition for turkey farm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TURKEY_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'turkey-farm',
  name: 'Turkey Farm',
  category: 'services',
  description: 'Turkey Farm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "turkey farm",
      "turkey",
      "farm",
      "turkey software",
      "turkey app",
      "turkey platform",
      "turkey system",
      "turkey management",
      "services turkey"
  ],

  synonyms: [
      "Turkey Farm platform",
      "Turkey Farm software",
      "Turkey Farm system",
      "turkey solution",
      "turkey service"
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
      "Build a turkey farm platform",
      "Create a turkey farm app",
      "I need a turkey farm management system",
      "Build a turkey farm solution",
      "Create a turkey farm booking system"
  ],
};
