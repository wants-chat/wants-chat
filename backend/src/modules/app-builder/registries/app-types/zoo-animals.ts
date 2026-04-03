/**
 * Zoo Animals App Type Definition
 *
 * Complete definition for zoo animals applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ZOO_ANIMALS_APP_TYPE: AppTypeDefinition = {
  id: 'zoo-animals',
  name: 'Zoo Animals',
  category: 'pets',
  description: 'Zoo Animals platform with comprehensive management features',
  icon: 'paw',

  keywords: [
      "zoo animals",
      "zoo",
      "animals",
      "zoo software",
      "zoo app",
      "zoo platform",
      "zoo system",
      "zoo management",
      "pets zoo"
  ],

  synonyms: [
      "Zoo Animals platform",
      "Zoo Animals software",
      "Zoo Animals system",
      "zoo solution",
      "zoo service"
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
      "client-intake",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "gallery",
      "reminders",
      "messaging"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'pets',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
      "Build a zoo animals platform",
      "Create a zoo animals app",
      "I need a zoo animals management system",
      "Build a zoo animals solution",
      "Create a zoo animals booking system"
  ],
};
