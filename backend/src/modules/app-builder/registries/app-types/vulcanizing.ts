/**
 * Vulcanizing App Type Definition
 *
 * Complete definition for vulcanizing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VULCANIZING_APP_TYPE: AppTypeDefinition = {
  id: 'vulcanizing',
  name: 'Vulcanizing',
  category: 'services',
  description: 'Vulcanizing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vulcanizing",
      "vulcanizing software",
      "vulcanizing app",
      "vulcanizing platform",
      "vulcanizing system",
      "vulcanizing management",
      "services vulcanizing"
  ],

  synonyms: [
      "Vulcanizing platform",
      "Vulcanizing software",
      "Vulcanizing system",
      "vulcanizing solution",
      "vulcanizing service"
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
      "Build a vulcanizing platform",
      "Create a vulcanizing app",
      "I need a vulcanizing management system",
      "Build a vulcanizing solution",
      "Create a vulcanizing booking system"
  ],
};
