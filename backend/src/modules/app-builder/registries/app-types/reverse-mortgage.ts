/**
 * Reverse Mortgage App Type Definition
 *
 * Complete definition for reverse mortgage applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REVERSE_MORTGAGE_APP_TYPE: AppTypeDefinition = {
  id: 'reverse-mortgage',
  name: 'Reverse Mortgage',
  category: 'services',
  description: 'Reverse Mortgage platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "reverse mortgage",
      "reverse",
      "mortgage",
      "reverse software",
      "reverse app",
      "reverse platform",
      "reverse system",
      "reverse management",
      "services reverse"
  ],

  synonyms: [
      "Reverse Mortgage platform",
      "Reverse Mortgage software",
      "Reverse Mortgage system",
      "reverse solution",
      "reverse service"
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
      "Build a reverse mortgage platform",
      "Create a reverse mortgage app",
      "I need a reverse mortgage management system",
      "Build a reverse mortgage solution",
      "Create a reverse mortgage booking system"
  ],
};
