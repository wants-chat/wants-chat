/**
 * Tower Crane App Type Definition
 *
 * Complete definition for tower crane applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOWER_CRANE_APP_TYPE: AppTypeDefinition = {
  id: 'tower-crane',
  name: 'Tower Crane',
  category: 'services',
  description: 'Tower Crane platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tower crane",
      "tower",
      "crane",
      "tower software",
      "tower app",
      "tower platform",
      "tower system",
      "tower management",
      "services tower"
  ],

  synonyms: [
      "Tower Crane platform",
      "Tower Crane software",
      "Tower Crane system",
      "tower solution",
      "tower service"
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
      "Build a tower crane platform",
      "Create a tower crane app",
      "I need a tower crane management system",
      "Build a tower crane solution",
      "Create a tower crane booking system"
  ],
};
