/**
 * Slaughterhouse App Type Definition
 *
 * Complete definition for slaughterhouse applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SLAUGHTERHOUSE_APP_TYPE: AppTypeDefinition = {
  id: 'slaughterhouse',
  name: 'Slaughterhouse',
  category: 'services',
  description: 'Slaughterhouse platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "slaughterhouse",
      "slaughterhouse software",
      "slaughterhouse app",
      "slaughterhouse platform",
      "slaughterhouse system",
      "slaughterhouse management",
      "services slaughterhouse"
  ],

  synonyms: [
      "Slaughterhouse platform",
      "Slaughterhouse software",
      "Slaughterhouse system",
      "slaughterhouse solution",
      "slaughterhouse service"
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
      "Build a slaughterhouse platform",
      "Create a slaughterhouse app",
      "I need a slaughterhouse management system",
      "Build a slaughterhouse solution",
      "Create a slaughterhouse booking system"
  ],
};
