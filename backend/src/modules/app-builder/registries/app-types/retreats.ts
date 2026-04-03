/**
 * Retreats App Type Definition
 *
 * Complete definition for retreats applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RETREATS_APP_TYPE: AppTypeDefinition = {
  id: 'retreats',
  name: 'Retreats',
  category: 'services',
  description: 'Retreats platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "retreats",
      "retreats software",
      "retreats app",
      "retreats platform",
      "retreats system",
      "retreats management",
      "services retreats"
  ],

  synonyms: [
      "Retreats platform",
      "Retreats software",
      "Retreats system",
      "retreats solution",
      "retreats service"
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
      "Build a retreats platform",
      "Create a retreats app",
      "I need a retreats management system",
      "Build a retreats solution",
      "Create a retreats booking system"
  ],
};
