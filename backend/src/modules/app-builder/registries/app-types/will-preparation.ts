/**
 * Will Preparation App Type Definition
 *
 * Complete definition for will preparation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WILL_PREPARATION_APP_TYPE: AppTypeDefinition = {
  id: 'will-preparation',
  name: 'Will Preparation',
  category: 'services',
  description: 'Will Preparation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "will preparation",
      "will",
      "preparation",
      "will software",
      "will app",
      "will platform",
      "will system",
      "will management",
      "services will"
  ],

  synonyms: [
      "Will Preparation platform",
      "Will Preparation software",
      "Will Preparation system",
      "will solution",
      "will service"
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
      "Build a will preparation platform",
      "Create a will preparation app",
      "I need a will preparation management system",
      "Build a will preparation solution",
      "Create a will preparation booking system"
  ],
};
