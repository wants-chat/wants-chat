/**
 * Perma Culture App Type Definition
 *
 * Complete definition for perma culture applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PERMA_CULTURE_APP_TYPE: AppTypeDefinition = {
  id: 'perma-culture',
  name: 'Perma Culture',
  category: 'services',
  description: 'Perma Culture platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "perma culture",
      "perma",
      "culture",
      "perma software",
      "perma app",
      "perma platform",
      "perma system",
      "perma management",
      "services perma"
  ],

  synonyms: [
      "Perma Culture platform",
      "Perma Culture software",
      "Perma Culture system",
      "perma solution",
      "perma service"
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
      "Build a perma culture platform",
      "Create a perma culture app",
      "I need a perma culture management system",
      "Build a perma culture solution",
      "Create a perma culture booking system"
  ],
};
