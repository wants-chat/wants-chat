/**
 * Tank Installation App Type Definition
 *
 * Complete definition for tank installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TANK_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'tank-installation',
  name: 'Tank Installation',
  category: 'services',
  description: 'Tank Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "tank installation",
      "tank",
      "installation",
      "tank software",
      "tank app",
      "tank platform",
      "tank system",
      "tank management",
      "services tank"
  ],

  synonyms: [
      "Tank Installation platform",
      "Tank Installation software",
      "Tank Installation system",
      "tank solution",
      "tank service"
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
      "Build a tank installation platform",
      "Create a tank installation app",
      "I need a tank installation management system",
      "Build a tank installation solution",
      "Create a tank installation booking system"
  ],
};
