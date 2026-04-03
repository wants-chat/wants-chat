/**
 * Rv Storage App Type Definition
 *
 * Complete definition for rv storage applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RV_STORAGE_APP_TYPE: AppTypeDefinition = {
  id: 'rv-storage',
  name: 'Rv Storage',
  category: 'services',
  description: 'Rv Storage platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "rv storage",
      "storage",
      "rv software",
      "rv app",
      "rv platform",
      "rv system",
      "rv management",
      "services rv"
  ],

  synonyms: [
      "Rv Storage platform",
      "Rv Storage software",
      "Rv Storage system",
      "rv solution",
      "rv service"
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
      "Build a rv storage platform",
      "Create a rv storage app",
      "I need a rv storage management system",
      "Build a rv storage solution",
      "Create a rv storage booking system"
  ],
};
