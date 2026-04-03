/**
 * Tiny Home App Type Definition
 *
 * Complete definition for tiny home applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TINY_HOME_APP_TYPE: AppTypeDefinition = {
  id: 'tiny-home',
  name: 'Tiny Home',
  category: 'services',
  description: 'Tiny Home platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tiny home",
      "tiny",
      "home",
      "tiny software",
      "tiny app",
      "tiny platform",
      "tiny system",
      "tiny management",
      "services tiny"
  ],

  synonyms: [
      "Tiny Home platform",
      "Tiny Home software",
      "Tiny Home system",
      "tiny solution",
      "tiny service"
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
      "Build a tiny home platform",
      "Create a tiny home app",
      "I need a tiny home management system",
      "Build a tiny home solution",
      "Create a tiny home booking system"
  ],
};
