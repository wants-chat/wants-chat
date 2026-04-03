/**
 * Refrigeration App Type Definition
 *
 * Complete definition for refrigeration applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REFRIGERATION_APP_TYPE: AppTypeDefinition = {
  id: 'refrigeration',
  name: 'Refrigeration',
  category: 'services',
  description: 'Refrigeration platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "refrigeration",
      "refrigeration software",
      "refrigeration app",
      "refrigeration platform",
      "refrigeration system",
      "refrigeration management",
      "services refrigeration"
  ],

  synonyms: [
      "Refrigeration platform",
      "Refrigeration software",
      "Refrigeration system",
      "refrigeration solution",
      "refrigeration service"
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
      "Build a refrigeration platform",
      "Create a refrigeration app",
      "I need a refrigeration management system",
      "Build a refrigeration solution",
      "Create a refrigeration booking system"
  ],
};
