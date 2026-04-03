/**
 * Microneedling App Type Definition
 *
 * Complete definition for microneedling applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MICRONEEDLING_APP_TYPE: AppTypeDefinition = {
  id: 'microneedling',
  name: 'Microneedling',
  category: 'services',
  description: 'Microneedling platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "microneedling",
      "microneedling software",
      "microneedling app",
      "microneedling platform",
      "microneedling system",
      "microneedling management",
      "services microneedling"
  ],

  synonyms: [
      "Microneedling platform",
      "Microneedling software",
      "Microneedling system",
      "microneedling solution",
      "microneedling service"
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
      "Build a microneedling platform",
      "Create a microneedling app",
      "I need a microneedling management system",
      "Build a microneedling solution",
      "Create a microneedling booking system"
  ],
};
