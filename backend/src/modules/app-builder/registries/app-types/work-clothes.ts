/**
 * Work Clothes App Type Definition
 *
 * Complete definition for work clothes applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORK_CLOTHES_APP_TYPE: AppTypeDefinition = {
  id: 'work-clothes',
  name: 'Work Clothes',
  category: 'services',
  description: 'Work Clothes platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "work clothes",
      "work",
      "clothes",
      "work software",
      "work app",
      "work platform",
      "work system",
      "work management",
      "services work"
  ],

  synonyms: [
      "Work Clothes platform",
      "Work Clothes software",
      "Work Clothes system",
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
      "Build a work clothes platform",
      "Create a work clothes app",
      "I need a work clothes management system",
      "Build a work clothes solution",
      "Create a work clothes booking system"
  ],
};
