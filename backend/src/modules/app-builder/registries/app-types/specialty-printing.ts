/**
 * Specialty Printing App Type Definition
 *
 * Complete definition for specialty printing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPECIALTY_PRINTING_APP_TYPE: AppTypeDefinition = {
  id: 'specialty-printing',
  name: 'Specialty Printing',
  category: 'services',
  description: 'Specialty Printing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "specialty printing",
      "specialty",
      "printing",
      "specialty software",
      "specialty app",
      "specialty platform",
      "specialty system",
      "specialty management",
      "services specialty"
  ],

  synonyms: [
      "Specialty Printing platform",
      "Specialty Printing software",
      "Specialty Printing system",
      "specialty solution",
      "specialty service"
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
      "Build a specialty printing platform",
      "Create a specialty printing app",
      "I need a specialty printing management system",
      "Build a specialty printing solution",
      "Create a specialty printing booking system"
  ],
};
