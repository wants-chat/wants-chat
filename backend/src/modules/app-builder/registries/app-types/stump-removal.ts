/**
 * Stump Removal App Type Definition
 *
 * Complete definition for stump removal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STUMP_REMOVAL_APP_TYPE: AppTypeDefinition = {
  id: 'stump-removal',
  name: 'Stump Removal',
  category: 'services',
  description: 'Stump Removal platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "stump removal",
      "stump",
      "removal",
      "stump software",
      "stump app",
      "stump platform",
      "stump system",
      "stump management",
      "services stump"
  ],

  synonyms: [
      "Stump Removal platform",
      "Stump Removal software",
      "Stump Removal system",
      "stump solution",
      "stump service"
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
      "Build a stump removal platform",
      "Create a stump removal app",
      "I need a stump removal management system",
      "Build a stump removal solution",
      "Create a stump removal booking system"
  ],
};
