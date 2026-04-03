/**
 * Door Installation App Type Definition
 *
 * Complete definition for door installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DOOR_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'door-installation',
  name: 'Door Installation',
  category: 'services',
  description: 'Door Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "door installation",
      "door",
      "installation",
      "door software",
      "door app",
      "door platform",
      "door system",
      "door management",
      "services door"
  ],

  synonyms: [
      "Door Installation platform",
      "Door Installation software",
      "Door Installation system",
      "door solution",
      "door service"
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
      "Build a door installation platform",
      "Create a door installation app",
      "I need a door installation management system",
      "Build a door installation solution",
      "Create a door installation booking system"
  ],
};
