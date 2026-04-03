/**
 * Shirt Printing App Type Definition
 *
 * Complete definition for shirt printing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHIRT_PRINTING_APP_TYPE: AppTypeDefinition = {
  id: 'shirt-printing',
  name: 'Shirt Printing',
  category: 'services',
  description: 'Shirt Printing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "shirt printing",
      "shirt",
      "printing",
      "shirt software",
      "shirt app",
      "shirt platform",
      "shirt system",
      "shirt management",
      "services shirt"
  ],

  synonyms: [
      "Shirt Printing platform",
      "Shirt Printing software",
      "Shirt Printing system",
      "shirt solution",
      "shirt service"
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
      "Build a shirt printing platform",
      "Create a shirt printing app",
      "I need a shirt printing management system",
      "Build a shirt printing solution",
      "Create a shirt printing booking system"
  ],
};
