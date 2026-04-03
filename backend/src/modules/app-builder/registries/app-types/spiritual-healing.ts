/**
 * Spiritual Healing App Type Definition
 *
 * Complete definition for spiritual healing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPIRITUAL_HEALING_APP_TYPE: AppTypeDefinition = {
  id: 'spiritual-healing',
  name: 'Spiritual Healing',
  category: 'services',
  description: 'Spiritual Healing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "spiritual healing",
      "spiritual",
      "healing",
      "spiritual software",
      "spiritual app",
      "spiritual platform",
      "spiritual system",
      "spiritual management",
      "services spiritual"
  ],

  synonyms: [
      "Spiritual Healing platform",
      "Spiritual Healing software",
      "Spiritual Healing system",
      "spiritual solution",
      "spiritual service"
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
      "Build a spiritual healing platform",
      "Create a spiritual healing app",
      "I need a spiritual healing management system",
      "Build a spiritual healing solution",
      "Create a spiritual healing booking system"
  ],
};
