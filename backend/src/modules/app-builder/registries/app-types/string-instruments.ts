/**
 * String Instruments App Type Definition
 *
 * Complete definition for string instruments applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STRING_INSTRUMENTS_APP_TYPE: AppTypeDefinition = {
  id: 'string-instruments',
  name: 'String Instruments',
  category: 'services',
  description: 'String Instruments platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "string instruments",
      "string",
      "instruments",
      "string software",
      "string app",
      "string platform",
      "string system",
      "string management",
      "services string"
  ],

  synonyms: [
      "String Instruments platform",
      "String Instruments software",
      "String Instruments system",
      "string solution",
      "string service"
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
      "Build a string instruments platform",
      "Create a string instruments app",
      "I need a string instruments management system",
      "Build a string instruments solution",
      "Create a string instruments booking system"
  ],
};
