/**
 * Judo App Type Definition
 *
 * Complete definition for judo applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const JUDO_APP_TYPE: AppTypeDefinition = {
  id: 'judo',
  name: 'Judo',
  category: 'services',
  description: 'Judo platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "judo",
      "judo software",
      "judo app",
      "judo platform",
      "judo system",
      "judo management",
      "services judo"
  ],

  synonyms: [
      "Judo platform",
      "Judo software",
      "Judo system",
      "judo solution",
      "judo service"
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
      "Build a judo platform",
      "Create a judo app",
      "I need a judo management system",
      "Build a judo solution",
      "Create a judo booking system"
  ],
};
