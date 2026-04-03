/**
 * Work From Home App Type Definition
 *
 * Complete definition for work from home applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORK_FROM_HOME_APP_TYPE: AppTypeDefinition = {
  id: 'work-from-home',
  name: 'Work From Home',
  category: 'services',
  description: 'Work From Home platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "work from home",
      "work",
      "from",
      "home",
      "work software",
      "work app",
      "work platform",
      "work system",
      "work management",
      "services work"
  ],

  synonyms: [
      "Work From Home platform",
      "Work From Home software",
      "Work From Home system",
      "work solution",
      "work service"
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
      "Build a work from home platform",
      "Create a work from home app",
      "I need a work from home management system",
      "Build a work from home solution",
      "Create a work from home booking system"
  ],
};
