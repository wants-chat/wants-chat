/**
 * Value Engineering App Type Definition
 *
 * Complete definition for value engineering applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VALUE_ENGINEERING_APP_TYPE: AppTypeDefinition = {
  id: 'value-engineering',
  name: 'Value Engineering',
  category: 'services',
  description: 'Value Engineering platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "value engineering",
      "value",
      "engineering",
      "value software",
      "value app",
      "value platform",
      "value system",
      "value management",
      "services value"
  ],

  synonyms: [
      "Value Engineering platform",
      "Value Engineering software",
      "Value Engineering system",
      "value solution",
      "value service"
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
      "Build a value engineering platform",
      "Create a value engineering app",
      "I need a value engineering management system",
      "Build a value engineering solution",
      "Create a value engineering booking system"
  ],
};
