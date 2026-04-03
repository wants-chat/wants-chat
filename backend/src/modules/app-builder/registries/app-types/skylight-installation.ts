/**
 * Skylight Installation App Type Definition
 *
 * Complete definition for skylight installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKYLIGHT_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'skylight-installation',
  name: 'Skylight Installation',
  category: 'services',
  description: 'Skylight Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "skylight installation",
      "skylight",
      "installation",
      "skylight software",
      "skylight app",
      "skylight platform",
      "skylight system",
      "skylight management",
      "services skylight"
  ],

  synonyms: [
      "Skylight Installation platform",
      "Skylight Installation software",
      "Skylight Installation system",
      "skylight solution",
      "skylight service"
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
      "Build a skylight installation platform",
      "Create a skylight installation app",
      "I need a skylight installation management system",
      "Build a skylight installation solution",
      "Create a skylight installation booking system"
  ],
};
