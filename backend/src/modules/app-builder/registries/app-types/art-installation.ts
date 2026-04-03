/**
 * Art Installation App Type Definition
 *
 * Complete definition for art installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ART_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'art-installation',
  name: 'Art Installation',
  category: 'services',
  description: 'Art Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "art installation",
      "art",
      "installation",
      "art software",
      "art app",
      "art platform",
      "art system",
      "art management",
      "services art"
  ],

  synonyms: [
      "Art Installation platform",
      "Art Installation software",
      "Art Installation system",
      "art solution",
      "art service"
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
      "Build a art installation platform",
      "Create a art installation app",
      "I need a art installation management system",
      "Build a art installation solution",
      "Create a art installation booking system"
  ],
};
