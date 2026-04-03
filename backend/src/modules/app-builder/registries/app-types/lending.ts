/**
 * Lending App Type Definition
 *
 * Complete definition for lending applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LENDING_APP_TYPE: AppTypeDefinition = {
  id: 'lending',
  name: 'Lending',
  category: 'services',
  description: 'Lending platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "lending",
      "lending software",
      "lending app",
      "lending platform",
      "lending system",
      "lending management",
      "services lending"
  ],

  synonyms: [
      "Lending platform",
      "Lending software",
      "Lending system",
      "lending solution",
      "lending service"
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
      "Build a lending platform",
      "Create a lending app",
      "I need a lending management system",
      "Build a lending solution",
      "Create a lending booking system"
  ],
};
