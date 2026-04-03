/**
 * Zen Center App Type Definition
 *
 * Complete definition for zen center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ZEN_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'zen-center',
  name: 'Zen Center',
  category: 'services',
  description: 'Zen Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "zen center",
      "zen",
      "center",
      "zen software",
      "zen app",
      "zen platform",
      "zen system",
      "zen management",
      "services zen"
  ],

  synonyms: [
      "Zen Center platform",
      "Zen Center software",
      "Zen Center system",
      "zen solution",
      "zen service"
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
      "Build a zen center platform",
      "Create a zen center app",
      "I need a zen center management system",
      "Build a zen center solution",
      "Create a zen center booking system"
  ],
};
