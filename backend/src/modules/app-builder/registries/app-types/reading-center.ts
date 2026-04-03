/**
 * Reading Center App Type Definition
 *
 * Complete definition for reading center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const READING_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'reading-center',
  name: 'Reading Center',
  category: 'services',
  description: 'Reading Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "reading center",
      "reading",
      "center",
      "reading software",
      "reading app",
      "reading platform",
      "reading system",
      "reading management",
      "services reading"
  ],

  synonyms: [
      "Reading Center platform",
      "Reading Center software",
      "Reading Center system",
      "reading solution",
      "reading service"
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
      "Build a reading center platform",
      "Create a reading center app",
      "I need a reading center management system",
      "Build a reading center solution",
      "Create a reading center booking system"
  ],
};
