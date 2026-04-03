/**
 * Lounge App Type Definition
 *
 * Complete definition for lounge applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LOUNGE_APP_TYPE: AppTypeDefinition = {
  id: 'lounge',
  name: 'Lounge',
  category: 'services',
  description: 'Lounge platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "lounge",
      "lounge software",
      "lounge app",
      "lounge platform",
      "lounge system",
      "lounge management",
      "services lounge"
  ],

  synonyms: [
      "Lounge platform",
      "Lounge software",
      "Lounge system",
      "lounge solution",
      "lounge service"
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
      "Build a lounge platform",
      "Create a lounge app",
      "I need a lounge management system",
      "Build a lounge solution",
      "Create a lounge booking system"
  ],
};
