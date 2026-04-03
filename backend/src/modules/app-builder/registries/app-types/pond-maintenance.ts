/**
 * Pond Maintenance App Type Definition
 *
 * Complete definition for pond maintenance applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POND_MAINTENANCE_APP_TYPE: AppTypeDefinition = {
  id: 'pond-maintenance',
  name: 'Pond Maintenance',
  category: 'services',
  description: 'Pond Maintenance platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "pond maintenance",
      "pond",
      "maintenance",
      "pond software",
      "pond app",
      "pond platform",
      "pond system",
      "pond management",
      "services pond"
  ],

  synonyms: [
      "Pond Maintenance platform",
      "Pond Maintenance software",
      "Pond Maintenance system",
      "pond solution",
      "pond service"
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
      "Build a pond maintenance platform",
      "Create a pond maintenance app",
      "I need a pond maintenance management system",
      "Build a pond maintenance solution",
      "Create a pond maintenance booking system"
  ],
};
