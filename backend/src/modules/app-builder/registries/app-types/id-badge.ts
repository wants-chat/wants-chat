/**
 * Id Badge App Type Definition
 *
 * Complete definition for id badge applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ID_BADGE_APP_TYPE: AppTypeDefinition = {
  id: 'id-badge',
  name: 'Id Badge',
  category: 'services',
  description: 'Id Badge platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "id badge",
      "badge",
      "id software",
      "id app",
      "id platform",
      "id system",
      "id management",
      "services id"
  ],

  synonyms: [
      "Id Badge platform",
      "Id Badge software",
      "Id Badge system",
      "id solution",
      "id service"
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
      "Build a id badge platform",
      "Create a id badge app",
      "I need a id badge management system",
      "Build a id badge solution",
      "Create a id badge booking system"
  ],
};
