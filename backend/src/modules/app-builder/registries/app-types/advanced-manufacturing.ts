/**
 * Advanced Manufacturing App Type Definition
 *
 * Complete definition for advanced manufacturing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ADVANCED_MANUFACTURING_APP_TYPE: AppTypeDefinition = {
  id: 'advanced-manufacturing',
  name: 'Advanced Manufacturing',
  category: 'services',
  description: 'Advanced Manufacturing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "advanced manufacturing",
      "advanced",
      "manufacturing",
      "advanced software",
      "advanced app",
      "advanced platform",
      "advanced system",
      "advanced management",
      "services advanced"
  ],

  synonyms: [
      "Advanced Manufacturing platform",
      "Advanced Manufacturing software",
      "Advanced Manufacturing system",
      "advanced solution",
      "advanced service"
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
      "Build a advanced manufacturing platform",
      "Create a advanced manufacturing app",
      "I need a advanced manufacturing management system",
      "Build a advanced manufacturing solution",
      "Create a advanced manufacturing booking system"
  ],
};
