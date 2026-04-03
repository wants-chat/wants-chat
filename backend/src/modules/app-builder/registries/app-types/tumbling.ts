/**
 * Tumbling App Type Definition
 *
 * Complete definition for tumbling applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TUMBLING_APP_TYPE: AppTypeDefinition = {
  id: 'tumbling',
  name: 'Tumbling',
  category: 'services',
  description: 'Tumbling platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tumbling",
      "tumbling software",
      "tumbling app",
      "tumbling platform",
      "tumbling system",
      "tumbling management",
      "services tumbling"
  ],

  synonyms: [
      "Tumbling platform",
      "Tumbling software",
      "Tumbling system",
      "tumbling solution",
      "tumbling service"
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
      "Build a tumbling platform",
      "Create a tumbling app",
      "I need a tumbling management system",
      "Build a tumbling solution",
      "Create a tumbling booking system"
  ],
};
