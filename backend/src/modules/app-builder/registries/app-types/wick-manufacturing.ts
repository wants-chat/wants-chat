/**
 * Wick Manufacturing App Type Definition
 *
 * Complete definition for wick manufacturing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WICK_MANUFACTURING_APP_TYPE: AppTypeDefinition = {
  id: 'wick-manufacturing',
  name: 'Wick Manufacturing',
  category: 'services',
  description: 'Wick Manufacturing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wick manufacturing",
      "wick",
      "manufacturing",
      "wick software",
      "wick app",
      "wick platform",
      "wick system",
      "wick management",
      "services wick"
  ],

  synonyms: [
      "Wick Manufacturing platform",
      "Wick Manufacturing software",
      "Wick Manufacturing system",
      "wick solution",
      "wick service"
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
      "Build a wick manufacturing platform",
      "Create a wick manufacturing app",
      "I need a wick manufacturing management system",
      "Build a wick manufacturing solution",
      "Create a wick manufacturing booking system"
  ],
};
