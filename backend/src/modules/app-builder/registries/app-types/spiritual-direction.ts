/**
 * Spiritual Direction App Type Definition
 *
 * Complete definition for spiritual direction applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPIRITUAL_DIRECTION_APP_TYPE: AppTypeDefinition = {
  id: 'spiritual-direction',
  name: 'Spiritual Direction',
  category: 'services',
  description: 'Spiritual Direction platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "spiritual direction",
      "spiritual",
      "direction",
      "spiritual software",
      "spiritual app",
      "spiritual platform",
      "spiritual system",
      "spiritual management",
      "services spiritual"
  ],

  synonyms: [
      "Spiritual Direction platform",
      "Spiritual Direction software",
      "Spiritual Direction system",
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
      "Build a spiritual direction platform",
      "Create a spiritual direction app",
      "I need a spiritual direction management system",
      "Build a spiritual direction solution",
      "Create a spiritual direction booking system"
  ],
};
