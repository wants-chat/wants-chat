/**
 * Underground Storage App Type Definition
 *
 * Complete definition for underground storage applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UNDERGROUND_STORAGE_APP_TYPE: AppTypeDefinition = {
  id: 'underground-storage',
  name: 'Underground Storage',
  category: 'services',
  description: 'Underground Storage platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "underground storage",
      "underground",
      "storage",
      "underground software",
      "underground app",
      "underground platform",
      "underground system",
      "underground management",
      "services underground"
  ],

  synonyms: [
      "Underground Storage platform",
      "Underground Storage software",
      "Underground Storage system",
      "underground solution",
      "underground service"
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
      "Build a underground storage platform",
      "Create a underground storage app",
      "I need a underground storage management system",
      "Build a underground storage solution",
      "Create a underground storage booking system"
  ],
};
