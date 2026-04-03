/**
 * Time Management App Type Definition
 *
 * Complete definition for time management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TIME_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'time-management',
  name: 'Time Management',
  category: 'services',
  description: 'Time Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "time management",
      "time",
      "management",
      "time software",
      "time app",
      "time platform",
      "time system",
      "services time"
  ],

  synonyms: [
      "Time Management platform",
      "Time Management software",
      "Time Management system",
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
      "Build a time management platform",
      "Create a time management app",
      "I need a time management management system",
      "Build a time management solution",
      "Create a time management booking system"
  ],
};
