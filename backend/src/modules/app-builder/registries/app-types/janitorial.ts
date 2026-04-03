/**
 * Janitorial App Type Definition
 *
 * Complete definition for janitorial applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const JANITORIAL_APP_TYPE: AppTypeDefinition = {
  id: 'janitorial',
  name: 'Janitorial',
  category: 'services',
  description: 'Janitorial platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "janitorial",
      "janitorial software",
      "janitorial app",
      "janitorial platform",
      "janitorial system",
      "janitorial management",
      "services janitorial"
  ],

  synonyms: [
      "Janitorial platform",
      "Janitorial software",
      "Janitorial system",
      "janitorial solution",
      "janitorial service"
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
      "Build a janitorial platform",
      "Create a janitorial app",
      "I need a janitorial management system",
      "Build a janitorial solution",
      "Create a janitorial booking system"
  ],
};
