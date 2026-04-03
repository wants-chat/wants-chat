/**
 * Anchor Installation App Type Definition
 *
 * Complete definition for anchor installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANCHOR_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'anchor-installation',
  name: 'Anchor Installation',
  category: 'services',
  description: 'Anchor Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "anchor installation",
      "anchor",
      "installation",
      "anchor software",
      "anchor app",
      "anchor platform",
      "anchor system",
      "anchor management",
      "services anchor"
  ],

  synonyms: [
      "Anchor Installation platform",
      "Anchor Installation software",
      "Anchor Installation system",
      "anchor solution",
      "anchor service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a anchor installation platform",
      "Create a anchor installation app",
      "I need a anchor installation management system",
      "Build a anchor installation solution",
      "Create a anchor installation booking system"
  ],
};
