/**
 * Rehabilitation App Type Definition
 *
 * Complete definition for rehabilitation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REHABILITATION_APP_TYPE: AppTypeDefinition = {
  id: 'rehabilitation',
  name: 'Rehabilitation',
  category: 'services',
  description: 'Rehabilitation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "rehabilitation",
      "rehabilitation software",
      "rehabilitation app",
      "rehabilitation platform",
      "rehabilitation system",
      "rehabilitation management",
      "services rehabilitation"
  ],

  synonyms: [
      "Rehabilitation platform",
      "Rehabilitation software",
      "Rehabilitation system",
      "rehabilitation solution",
      "rehabilitation service"
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
      "Build a rehabilitation platform",
      "Create a rehabilitation app",
      "I need a rehabilitation management system",
      "Build a rehabilitation solution",
      "Create a rehabilitation booking system"
  ],
};
