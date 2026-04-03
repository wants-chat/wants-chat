/**
 * Lumber Yard App Type Definition
 *
 * Complete definition for lumber yard applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LUMBER_YARD_APP_TYPE: AppTypeDefinition = {
  id: 'lumber-yard',
  name: 'Lumber Yard',
  category: 'services',
  description: 'Lumber Yard platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "lumber yard",
      "lumber",
      "yard",
      "lumber software",
      "lumber app",
      "lumber platform",
      "lumber system",
      "lumber management",
      "services lumber"
  ],

  synonyms: [
      "Lumber Yard platform",
      "Lumber Yard software",
      "Lumber Yard system",
      "lumber solution",
      "lumber service"
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
      "Build a lumber yard platform",
      "Create a lumber yard app",
      "I need a lumber yard management system",
      "Build a lumber yard solution",
      "Create a lumber yard booking system"
  ],
};
