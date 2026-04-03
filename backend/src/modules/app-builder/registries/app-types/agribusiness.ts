/**
 * Agribusiness App Type Definition
 *
 * Complete definition for agribusiness applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AGRIBUSINESS_APP_TYPE: AppTypeDefinition = {
  id: 'agribusiness',
  name: 'Agribusiness',
  category: 'services',
  description: 'Agribusiness platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "agribusiness",
      "agribusiness software",
      "agribusiness app",
      "agribusiness platform",
      "agribusiness system",
      "agribusiness management",
      "services agribusiness"
  ],

  synonyms: [
      "Agribusiness platform",
      "Agribusiness software",
      "Agribusiness system",
      "agribusiness solution",
      "agribusiness service"
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
      "Build a agribusiness platform",
      "Create a agribusiness app",
      "I need a agribusiness management system",
      "Build a agribusiness solution",
      "Create a agribusiness booking system"
  ],
};
