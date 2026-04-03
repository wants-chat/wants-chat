/**
 * Racing App Type Definition
 *
 * Complete definition for racing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RACING_APP_TYPE: AppTypeDefinition = {
  id: 'racing',
  name: 'Racing',
  category: 'services',
  description: 'Racing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "racing",
      "racing software",
      "racing app",
      "racing platform",
      "racing system",
      "racing management",
      "services racing"
  ],

  synonyms: [
      "Racing platform",
      "Racing software",
      "Racing system",
      "racing solution",
      "racing service"
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
      "Build a racing platform",
      "Create a racing app",
      "I need a racing management system",
      "Build a racing solution",
      "Create a racing booking system"
  ],
};
