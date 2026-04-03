/**
 * Tune Up App Type Definition
 *
 * Complete definition for tune up applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TUNE_UP_APP_TYPE: AppTypeDefinition = {
  id: 'tune-up',
  name: 'Tune Up',
  category: 'services',
  description: 'Tune Up platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tune up",
      "tune",
      "tune software",
      "tune app",
      "tune platform",
      "tune system",
      "tune management",
      "services tune"
  ],

  synonyms: [
      "Tune Up platform",
      "Tune Up software",
      "Tune Up system",
      "tune solution",
      "tune service"
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
      "Build a tune up platform",
      "Create a tune up app",
      "I need a tune up management system",
      "Build a tune up solution",
      "Create a tune up booking system"
  ],
};
