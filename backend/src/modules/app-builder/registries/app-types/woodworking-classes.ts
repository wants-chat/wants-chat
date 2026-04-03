/**
 * Woodworking Classes App Type Definition
 *
 * Complete definition for woodworking classes applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOODWORKING_CLASSES_APP_TYPE: AppTypeDefinition = {
  id: 'woodworking-classes',
  name: 'Woodworking Classes',
  category: 'services',
  description: 'Woodworking Classes platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "woodworking classes",
      "woodworking",
      "classes",
      "woodworking software",
      "woodworking app",
      "woodworking platform",
      "woodworking system",
      "woodworking management",
      "services woodworking"
  ],

  synonyms: [
      "Woodworking Classes platform",
      "Woodworking Classes software",
      "Woodworking Classes system",
      "woodworking solution",
      "woodworking service"
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
      "Build a woodworking classes platform",
      "Create a woodworking classes app",
      "I need a woodworking classes management system",
      "Build a woodworking classes solution",
      "Create a woodworking classes booking system"
  ],
};
