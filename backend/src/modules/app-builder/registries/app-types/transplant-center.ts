/**
 * Transplant Center App Type Definition
 *
 * Complete definition for transplant center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRANSPLANT_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'transplant-center',
  name: 'Transplant Center',
  category: 'services',
  description: 'Transplant Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "transplant center",
      "transplant",
      "center",
      "transplant software",
      "transplant app",
      "transplant platform",
      "transplant system",
      "transplant management",
      "services transplant"
  ],

  synonyms: [
      "Transplant Center platform",
      "Transplant Center software",
      "Transplant Center system",
      "transplant solution",
      "transplant service"
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
      "Build a transplant center platform",
      "Create a transplant center app",
      "I need a transplant center management system",
      "Build a transplant center solution",
      "Create a transplant center booking system"
  ],
};
