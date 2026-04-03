/**
 * Zen Garden App Type Definition
 *
 * Complete definition for zen garden applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ZEN_GARDEN_APP_TYPE: AppTypeDefinition = {
  id: 'zen-garden',
  name: 'Zen Garden',
  category: 'services',
  description: 'Zen Garden platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "zen garden",
      "zen",
      "garden",
      "zen software",
      "zen app",
      "zen platform",
      "zen system",
      "zen management",
      "services zen"
  ],

  synonyms: [
      "Zen Garden platform",
      "Zen Garden software",
      "Zen Garden system",
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
      "Build a zen garden platform",
      "Create a zen garden app",
      "I need a zen garden management system",
      "Build a zen garden solution",
      "Create a zen garden booking system"
  ],
};
