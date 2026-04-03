/**
 * Yachting App Type Definition
 *
 * Complete definition for yachting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YACHTING_APP_TYPE: AppTypeDefinition = {
  id: 'yachting',
  name: 'Yachting',
  category: 'services',
  description: 'Yachting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "yachting",
      "yachting software",
      "yachting app",
      "yachting platform",
      "yachting system",
      "yachting management",
      "services yachting"
  ],

  synonyms: [
      "Yachting platform",
      "Yachting software",
      "Yachting system",
      "yachting solution",
      "yachting service"
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
      "Build a yachting platform",
      "Create a yachting app",
      "I need a yachting management system",
      "Build a yachting solution",
      "Create a yachting booking system"
  ],
};
