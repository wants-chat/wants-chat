/**
 * T Shirt Printing App Type Definition
 *
 * Complete definition for t shirt printing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const T_SHIRT_PRINTING_APP_TYPE: AppTypeDefinition = {
  id: 't-shirt-printing',
  name: 'T Shirt Printing',
  category: 'services',
  description: 'T Shirt Printing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "t shirt printing",
      "shirt",
      "printing",
      "t software",
      "t app",
      "t platform",
      "t system",
      "t management",
      "services t"
  ],

  synonyms: [
      "T Shirt Printing platform",
      "T Shirt Printing software",
      "T Shirt Printing system",
      "t solution",
      "t service"
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
      "Build a t shirt printing platform",
      "Create a t shirt printing app",
      "I need a t shirt printing management system",
      "Build a t shirt printing solution",
      "Create a t shirt printing booking system"
  ],
};
