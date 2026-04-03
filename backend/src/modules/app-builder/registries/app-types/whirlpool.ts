/**
 * Whirlpool App Type Definition
 *
 * Complete definition for whirlpool applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHIRLPOOL_APP_TYPE: AppTypeDefinition = {
  id: 'whirlpool',
  name: 'Whirlpool',
  category: 'services',
  description: 'Whirlpool platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "whirlpool",
      "whirlpool software",
      "whirlpool app",
      "whirlpool platform",
      "whirlpool system",
      "whirlpool management",
      "services whirlpool"
  ],

  synonyms: [
      "Whirlpool platform",
      "Whirlpool software",
      "Whirlpool system",
      "whirlpool solution",
      "whirlpool service"
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
      "Build a whirlpool platform",
      "Create a whirlpool app",
      "I need a whirlpool management system",
      "Build a whirlpool solution",
      "Create a whirlpool booking system"
  ],
};
