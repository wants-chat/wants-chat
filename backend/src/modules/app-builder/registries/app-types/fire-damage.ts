/**
 * Fire Damage App Type Definition
 *
 * Complete definition for fire damage applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FIRE_DAMAGE_APP_TYPE: AppTypeDefinition = {
  id: 'fire-damage',
  name: 'Fire Damage',
  category: 'services',
  description: 'Fire Damage platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "fire damage",
      "fire",
      "damage",
      "fire software",
      "fire app",
      "fire platform",
      "fire system",
      "fire management",
      "services fire"
  ],

  synonyms: [
      "Fire Damage platform",
      "Fire Damage software",
      "Fire Damage system",
      "fire solution",
      "fire service"
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
      "Build a fire damage platform",
      "Create a fire damage app",
      "I need a fire damage management system",
      "Build a fire damage solution",
      "Create a fire damage booking system"
  ],
};
