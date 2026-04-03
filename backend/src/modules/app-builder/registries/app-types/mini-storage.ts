/**
 * Mini Storage App Type Definition
 *
 * Complete definition for mini storage applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MINI_STORAGE_APP_TYPE: AppTypeDefinition = {
  id: 'mini-storage',
  name: 'Mini Storage',
  category: 'services',
  description: 'Mini Storage platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "mini storage",
      "mini",
      "storage",
      "mini software",
      "mini app",
      "mini platform",
      "mini system",
      "mini management",
      "services mini"
  ],

  synonyms: [
      "Mini Storage platform",
      "Mini Storage software",
      "Mini Storage system",
      "mini solution",
      "mini service"
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
      "Build a mini storage platform",
      "Create a mini storage app",
      "I need a mini storage management system",
      "Build a mini storage solution",
      "Create a mini storage booking system"
  ],
};
