/**
 * Cooperative App Type Definition
 *
 * Complete definition for cooperative applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COOPERATIVE_APP_TYPE: AppTypeDefinition = {
  id: 'cooperative',
  name: 'Cooperative',
  category: 'services',
  description: 'Cooperative platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "cooperative",
      "cooperative software",
      "cooperative app",
      "cooperative platform",
      "cooperative system",
      "cooperative management",
      "services cooperative"
  ],

  synonyms: [
      "Cooperative platform",
      "Cooperative software",
      "Cooperative system",
      "cooperative solution",
      "cooperative service"
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
      "Build a cooperative platform",
      "Create a cooperative app",
      "I need a cooperative management system",
      "Build a cooperative solution",
      "Create a cooperative booking system"
  ],
};
