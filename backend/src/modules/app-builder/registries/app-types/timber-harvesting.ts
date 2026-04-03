/**
 * Timber Harvesting App Type Definition
 *
 * Complete definition for timber harvesting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TIMBER_HARVESTING_APP_TYPE: AppTypeDefinition = {
  id: 'timber-harvesting',
  name: 'Timber Harvesting',
  category: 'services',
  description: 'Timber Harvesting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "timber harvesting",
      "timber",
      "harvesting",
      "timber software",
      "timber app",
      "timber platform",
      "timber system",
      "timber management",
      "services timber"
  ],

  synonyms: [
      "Timber Harvesting platform",
      "Timber Harvesting software",
      "Timber Harvesting system",
      "timber solution",
      "timber service"
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
      "Build a timber harvesting platform",
      "Create a timber harvesting app",
      "I need a timber harvesting management system",
      "Build a timber harvesting solution",
      "Create a timber harvesting booking system"
  ],
};
