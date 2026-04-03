/**
 * Second Hand App Type Definition
 *
 * Complete definition for second hand applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SECOND_HAND_APP_TYPE: AppTypeDefinition = {
  id: 'second-hand',
  name: 'Second Hand',
  category: 'services',
  description: 'Second Hand platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "second hand",
      "second",
      "hand",
      "second software",
      "second app",
      "second platform",
      "second system",
      "second management",
      "services second"
  ],

  synonyms: [
      "Second Hand platform",
      "Second Hand software",
      "Second Hand system",
      "second solution",
      "second service"
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
      "Build a second hand platform",
      "Create a second hand app",
      "I need a second hand management system",
      "Build a second hand solution",
      "Create a second hand booking system"
  ],
};
