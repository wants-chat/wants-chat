/**
 * Universal Design App Type Definition
 *
 * Complete definition for universal design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UNIVERSAL_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'universal-design',
  name: 'Universal Design',
  category: 'services',
  description: 'Universal Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "universal design",
      "universal",
      "design",
      "universal software",
      "universal app",
      "universal platform",
      "universal system",
      "universal management",
      "services universal"
  ],

  synonyms: [
      "Universal Design platform",
      "Universal Design software",
      "Universal Design system",
      "universal solution",
      "universal service"
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
      "Build a universal design platform",
      "Create a universal design app",
      "I need a universal design management system",
      "Build a universal design solution",
      "Create a universal design booking system"
  ],
};
