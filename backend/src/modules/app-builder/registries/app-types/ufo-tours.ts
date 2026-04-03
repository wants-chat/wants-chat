/**
 * Ufo Tours App Type Definition
 *
 * Complete definition for ufo tours applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UFO_TOURS_APP_TYPE: AppTypeDefinition = {
  id: 'ufo-tours',
  name: 'Ufo Tours',
  category: 'services',
  description: 'Ufo Tours platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ufo tours",
      "ufo",
      "tours",
      "ufo software",
      "ufo app",
      "ufo platform",
      "ufo system",
      "ufo management",
      "services ufo"
  ],

  synonyms: [
      "Ufo Tours platform",
      "Ufo Tours software",
      "Ufo Tours system",
      "ufo solution",
      "ufo service"
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
      "Build a ufo tours platform",
      "Create a ufo tours app",
      "I need a ufo tours management system",
      "Build a ufo tours solution",
      "Create a ufo tours booking system"
  ],
};
