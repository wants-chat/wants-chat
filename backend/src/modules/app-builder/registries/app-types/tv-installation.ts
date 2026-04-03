/**
 * Tv Installation App Type Definition
 *
 * Complete definition for tv installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TV_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'tv-installation',
  name: 'Tv Installation',
  category: 'services',
  description: 'Tv Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "tv installation",
      "installation",
      "tv software",
      "tv app",
      "tv platform",
      "tv system",
      "tv management",
      "services tv"
  ],

  synonyms: [
      "Tv Installation platform",
      "Tv Installation software",
      "Tv Installation system",
      "tv solution",
      "tv service"
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
      "Build a tv installation platform",
      "Create a tv installation app",
      "I need a tv installation management system",
      "Build a tv installation solution",
      "Create a tv installation booking system"
  ],
};
