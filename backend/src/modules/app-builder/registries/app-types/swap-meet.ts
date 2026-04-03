/**
 * Swap Meet App Type Definition
 *
 * Complete definition for swap meet applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SWAP_MEET_APP_TYPE: AppTypeDefinition = {
  id: 'swap-meet',
  name: 'Swap Meet',
  category: 'services',
  description: 'Swap Meet platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "swap meet",
      "swap",
      "meet",
      "swap software",
      "swap app",
      "swap platform",
      "swap system",
      "swap management",
      "services swap"
  ],

  synonyms: [
      "Swap Meet platform",
      "Swap Meet software",
      "Swap Meet system",
      "swap solution",
      "swap service"
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
      "Build a swap meet platform",
      "Create a swap meet app",
      "I need a swap meet management system",
      "Build a swap meet solution",
      "Create a swap meet booking system"
  ],
};
