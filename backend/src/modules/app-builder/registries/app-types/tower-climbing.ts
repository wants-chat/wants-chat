/**
 * Tower Climbing App Type Definition
 *
 * Complete definition for tower climbing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOWER_CLIMBING_APP_TYPE: AppTypeDefinition = {
  id: 'tower-climbing',
  name: 'Tower Climbing',
  category: 'services',
  description: 'Tower Climbing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tower climbing",
      "tower",
      "climbing",
      "tower software",
      "tower app",
      "tower platform",
      "tower system",
      "tower management",
      "services tower"
  ],

  synonyms: [
      "Tower Climbing platform",
      "Tower Climbing software",
      "Tower Climbing system",
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
      "Build a tower climbing platform",
      "Create a tower climbing app",
      "I need a tower climbing management system",
      "Build a tower climbing solution",
      "Create a tower climbing booking system"
  ],
};
