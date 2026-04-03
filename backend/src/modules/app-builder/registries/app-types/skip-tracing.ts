/**
 * Skip Tracing App Type Definition
 *
 * Complete definition for skip tracing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKIP_TRACING_APP_TYPE: AppTypeDefinition = {
  id: 'skip-tracing',
  name: 'Skip Tracing',
  category: 'services',
  description: 'Skip Tracing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "skip tracing",
      "skip",
      "tracing",
      "skip software",
      "skip app",
      "skip platform",
      "skip system",
      "skip management",
      "services skip"
  ],

  synonyms: [
      "Skip Tracing platform",
      "Skip Tracing software",
      "Skip Tracing system",
      "skip solution",
      "skip service"
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
      "Build a skip tracing platform",
      "Create a skip tracing app",
      "I need a skip tracing management system",
      "Build a skip tracing solution",
      "Create a skip tracing booking system"
  ],
};
