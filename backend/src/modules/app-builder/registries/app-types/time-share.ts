/**
 * Time Share App Type Definition
 *
 * Complete definition for time share applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TIME_SHARE_APP_TYPE: AppTypeDefinition = {
  id: 'time-share',
  name: 'Time Share',
  category: 'services',
  description: 'Time Share platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "time share",
      "time",
      "share",
      "time software",
      "time app",
      "time platform",
      "time system",
      "time management",
      "services time"
  ],

  synonyms: [
      "Time Share platform",
      "Time Share software",
      "Time Share system",
      "time solution",
      "time service"
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
      "Build a time share platform",
      "Create a time share app",
      "I need a time share management system",
      "Build a time share solution",
      "Create a time share booking system"
  ],
};
