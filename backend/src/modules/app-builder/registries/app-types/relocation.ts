/**
 * Relocation App Type Definition
 *
 * Complete definition for relocation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RELOCATION_APP_TYPE: AppTypeDefinition = {
  id: 'relocation',
  name: 'Relocation',
  category: 'services',
  description: 'Relocation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "relocation",
      "relocation software",
      "relocation app",
      "relocation platform",
      "relocation system",
      "relocation management",
      "services relocation"
  ],

  synonyms: [
      "Relocation platform",
      "Relocation software",
      "Relocation system",
      "relocation solution",
      "relocation service"
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
      "Build a relocation platform",
      "Create a relocation app",
      "I need a relocation management system",
      "Build a relocation solution",
      "Create a relocation booking system"
  ],
};
