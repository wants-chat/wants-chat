/**
 * Millwork App Type Definition
 *
 * Complete definition for millwork applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MILLWORK_APP_TYPE: AppTypeDefinition = {
  id: 'millwork',
  name: 'Millwork',
  category: 'services',
  description: 'Millwork platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "millwork",
      "millwork software",
      "millwork app",
      "millwork platform",
      "millwork system",
      "millwork management",
      "services millwork"
  ],

  synonyms: [
      "Millwork platform",
      "Millwork software",
      "Millwork system",
      "millwork solution",
      "millwork service"
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
      "Build a millwork platform",
      "Create a millwork app",
      "I need a millwork management system",
      "Build a millwork solution",
      "Create a millwork booking system"
  ],
};
