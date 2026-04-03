/**
 * Telephone Answering App Type Definition
 *
 * Complete definition for telephone answering applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TELEPHONE_ANSWERING_APP_TYPE: AppTypeDefinition = {
  id: 'telephone-answering',
  name: 'Telephone Answering',
  category: 'services',
  description: 'Telephone Answering platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "telephone answering",
      "telephone",
      "answering",
      "telephone software",
      "telephone app",
      "telephone platform",
      "telephone system",
      "telephone management",
      "services telephone"
  ],

  synonyms: [
      "Telephone Answering platform",
      "Telephone Answering software",
      "Telephone Answering system",
      "telephone solution",
      "telephone service"
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
      "Build a telephone answering platform",
      "Create a telephone answering app",
      "I need a telephone answering management system",
      "Build a telephone answering solution",
      "Create a telephone answering booking system"
  ],
};
