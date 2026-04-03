/**
 * Oyster Farm App Type Definition
 *
 * Complete definition for oyster farm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OYSTER_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'oyster-farm',
  name: 'Oyster Farm',
  category: 'services',
  description: 'Oyster Farm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "oyster farm",
      "oyster",
      "farm",
      "oyster software",
      "oyster app",
      "oyster platform",
      "oyster system",
      "oyster management",
      "services oyster"
  ],

  synonyms: [
      "Oyster Farm platform",
      "Oyster Farm software",
      "Oyster Farm system",
      "oyster solution",
      "oyster service"
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
      "Build a oyster farm platform",
      "Create a oyster farm app",
      "I need a oyster farm management system",
      "Build a oyster farm solution",
      "Create a oyster farm booking system"
  ],
};
