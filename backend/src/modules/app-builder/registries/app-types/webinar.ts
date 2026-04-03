/**
 * Webinar App Type Definition
 *
 * Complete definition for webinar applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEBINAR_APP_TYPE: AppTypeDefinition = {
  id: 'webinar',
  name: 'Webinar',
  category: 'technology',
  description: 'Webinar platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "webinar",
      "webinar software",
      "webinar app",
      "webinar platform",
      "webinar system",
      "webinar management",
      "technology webinar"
  ],

  synonyms: [
      "Webinar platform",
      "Webinar software",
      "Webinar system",
      "webinar solution",
      "webinar service"
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
      "projects",
      "tasks",
      "documents",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "time-tracking",
      "invoicing",
      "clients",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a webinar platform",
      "Create a webinar app",
      "I need a webinar management system",
      "Build a webinar solution",
      "Create a webinar booking system"
  ],
};
