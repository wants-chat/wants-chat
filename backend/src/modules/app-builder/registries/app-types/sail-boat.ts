/**
 * Sail Boat App Type Definition
 *
 * Complete definition for sail boat applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SAIL_BOAT_APP_TYPE: AppTypeDefinition = {
  id: 'sail-boat',
  name: 'Sail Boat',
  category: 'services',
  description: 'Sail Boat platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sail boat",
      "sail",
      "boat",
      "sail software",
      "sail app",
      "sail platform",
      "sail system",
      "sail management",
      "services sail"
  ],

  synonyms: [
      "Sail Boat platform",
      "Sail Boat software",
      "Sail Boat system",
      "sail solution",
      "sail service"
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
      "Build a sail boat platform",
      "Create a sail boat app",
      "I need a sail boat management system",
      "Build a sail boat solution",
      "Create a sail boat booking system"
  ],
};
