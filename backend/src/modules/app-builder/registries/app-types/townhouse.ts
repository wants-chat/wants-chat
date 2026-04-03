/**
 * Townhouse App Type Definition
 *
 * Complete definition for townhouse applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOWNHOUSE_APP_TYPE: AppTypeDefinition = {
  id: 'townhouse',
  name: 'Townhouse',
  category: 'services',
  description: 'Townhouse platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "townhouse",
      "townhouse software",
      "townhouse app",
      "townhouse platform",
      "townhouse system",
      "townhouse management",
      "services townhouse"
  ],

  synonyms: [
      "Townhouse platform",
      "Townhouse software",
      "Townhouse system",
      "townhouse solution",
      "townhouse service"
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
      "Build a townhouse platform",
      "Create a townhouse app",
      "I need a townhouse management system",
      "Build a townhouse solution",
      "Create a townhouse booking system"
  ],
};
