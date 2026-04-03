/**
 * Work Boots App Type Definition
 *
 * Complete definition for work boots applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORK_BOOTS_APP_TYPE: AppTypeDefinition = {
  id: 'work-boots',
  name: 'Work Boots',
  category: 'services',
  description: 'Work Boots platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "work boots",
      "work",
      "boots",
      "work software",
      "work app",
      "work platform",
      "work system",
      "work management",
      "services work"
  ],

  synonyms: [
      "Work Boots platform",
      "Work Boots software",
      "Work Boots system",
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
      "Build a work boots platform",
      "Create a work boots app",
      "I need a work boots management system",
      "Build a work boots solution",
      "Create a work boots booking system"
  ],
};
