/**
 * Tourism App Type Definition
 *
 * Complete definition for tourism applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOURISM_APP_TYPE: AppTypeDefinition = {
  id: 'tourism',
  name: 'Tourism',
  category: 'services',
  description: 'Tourism platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tourism",
      "tourism software",
      "tourism app",
      "tourism platform",
      "tourism system",
      "tourism management",
      "services tourism"
  ],

  synonyms: [
      "Tourism platform",
      "Tourism software",
      "Tourism system",
      "tourism solution",
      "tourism service"
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
      "Build a tourism platform",
      "Create a tourism app",
      "I need a tourism management system",
      "Build a tourism solution",
      "Create a tourism booking system"
  ],
};
