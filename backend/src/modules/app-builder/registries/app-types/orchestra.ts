/**
 * Orchestra App Type Definition
 *
 * Complete definition for orchestra applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ORCHESTRA_APP_TYPE: AppTypeDefinition = {
  id: 'orchestra',
  name: 'Orchestra',
  category: 'services',
  description: 'Orchestra platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "orchestra",
      "orchestra software",
      "orchestra app",
      "orchestra platform",
      "orchestra system",
      "orchestra management",
      "services orchestra"
  ],

  synonyms: [
      "Orchestra platform",
      "Orchestra software",
      "Orchestra system",
      "orchestra solution",
      "orchestra service"
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
      "Build a orchestra platform",
      "Create a orchestra app",
      "I need a orchestra management system",
      "Build a orchestra solution",
      "Create a orchestra booking system"
  ],
};
