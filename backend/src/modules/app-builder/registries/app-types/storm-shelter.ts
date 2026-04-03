/**
 * Storm Shelter App Type Definition
 *
 * Complete definition for storm shelter applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STORM_SHELTER_APP_TYPE: AppTypeDefinition = {
  id: 'storm-shelter',
  name: 'Storm Shelter',
  category: 'services',
  description: 'Storm Shelter platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "storm shelter",
      "storm",
      "shelter",
      "storm software",
      "storm app",
      "storm platform",
      "storm system",
      "storm management",
      "services storm"
  ],

  synonyms: [
      "Storm Shelter platform",
      "Storm Shelter software",
      "Storm Shelter system",
      "storm solution",
      "storm service"
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
      "Build a storm shelter platform",
      "Create a storm shelter app",
      "I need a storm shelter management system",
      "Build a storm shelter solution",
      "Create a storm shelter booking system"
  ],
};
