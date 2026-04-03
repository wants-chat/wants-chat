/**
 * Charter Bus App Type Definition
 *
 * Complete definition for charter bus applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CHARTER_BUS_APP_TYPE: AppTypeDefinition = {
  id: 'charter-bus',
  name: 'Charter Bus',
  category: 'services',
  description: 'Charter Bus platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "charter bus",
      "charter",
      "bus",
      "charter software",
      "charter app",
      "charter platform",
      "charter system",
      "charter management",
      "services charter"
  ],

  synonyms: [
      "Charter Bus platform",
      "Charter Bus software",
      "Charter Bus system",
      "charter solution",
      "charter service"
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
      "Build a charter bus platform",
      "Create a charter bus app",
      "I need a charter bus management system",
      "Build a charter bus solution",
      "Create a charter bus booking system"
  ],
};
