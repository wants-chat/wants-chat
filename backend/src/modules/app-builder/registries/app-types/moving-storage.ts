/**
 * Moving Storage App Type Definition
 *
 * Complete definition for moving storage applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOVING_STORAGE_APP_TYPE: AppTypeDefinition = {
  id: 'moving-storage',
  name: 'Moving Storage',
  category: 'logistics',
  description: 'Moving Storage platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "moving storage",
      "moving",
      "storage",
      "moving software",
      "moving app",
      "moving platform",
      "moving system",
      "moving management",
      "services moving"
  ],

  synonyms: [
      "Moving Storage platform",
      "Moving Storage software",
      "Moving Storage system",
      "moving solution",
      "moving service"
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
      "reservations",
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "contracts",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a moving storage platform",
      "Create a moving storage app",
      "I need a moving storage management system",
      "Build a moving storage solution",
      "Create a moving storage booking system"
  ],
};
