/**
 * Artificial Intelligence App Type Definition
 *
 * Complete definition for artificial intelligence applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARTIFICIAL_INTELLIGENCE_APP_TYPE: AppTypeDefinition = {
  id: 'artificial-intelligence',
  name: 'Artificial Intelligence',
  category: 'services',
  description: 'Artificial Intelligence platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "artificial intelligence",
      "artificial",
      "intelligence",
      "artificial software",
      "artificial app",
      "artificial platform",
      "artificial system",
      "artificial management",
      "services artificial"
  ],

  synonyms: [
      "Artificial Intelligence platform",
      "Artificial Intelligence software",
      "Artificial Intelligence system",
      "artificial solution",
      "artificial service"
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
      "Build a artificial intelligence platform",
      "Create a artificial intelligence app",
      "I need a artificial intelligence management system",
      "Build a artificial intelligence solution",
      "Create a artificial intelligence booking system"
  ],
};
