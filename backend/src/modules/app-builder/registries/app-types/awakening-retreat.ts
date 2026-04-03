/**
 * Awakening Retreat App Type Definition
 *
 * Complete definition for awakening retreat applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AWAKENING_RETREAT_APP_TYPE: AppTypeDefinition = {
  id: 'awakening-retreat',
  name: 'Awakening Retreat',
  category: 'services',
  description: 'Awakening Retreat platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "awakening retreat",
      "awakening",
      "retreat",
      "awakening software",
      "awakening app",
      "awakening platform",
      "awakening system",
      "awakening management",
      "services awakening"
  ],

  synonyms: [
      "Awakening Retreat platform",
      "Awakening Retreat software",
      "Awakening Retreat system",
      "awakening solution",
      "awakening service"
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
      "Build a awakening retreat platform",
      "Create a awakening retreat app",
      "I need a awakening retreat management system",
      "Build a awakening retreat solution",
      "Create a awakening retreat booking system"
  ],
};
