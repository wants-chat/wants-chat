/**
 * Hot Springs App Type Definition
 *
 * Complete definition for hot springs applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOT_SPRINGS_APP_TYPE: AppTypeDefinition = {
  id: 'hot-springs',
  name: 'Hot Springs',
  category: 'services',
  description: 'Hot Springs platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "hot springs",
      "hot",
      "springs",
      "hot software",
      "hot app",
      "hot platform",
      "hot system",
      "hot management",
      "services hot"
  ],

  synonyms: [
      "Hot Springs platform",
      "Hot Springs software",
      "Hot Springs system",
      "hot solution",
      "hot service"
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
      "Build a hot springs platform",
      "Create a hot springs app",
      "I need a hot springs management system",
      "Build a hot springs solution",
      "Create a hot springs booking system"
  ],
};
