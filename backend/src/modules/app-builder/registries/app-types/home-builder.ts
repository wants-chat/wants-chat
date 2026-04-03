/**
 * Home Builder App Type Definition
 *
 * Complete definition for home builder applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOME_BUILDER_APP_TYPE: AppTypeDefinition = {
  id: 'home-builder',
  name: 'Home Builder',
  category: 'construction',
  description: 'Home Builder platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "home builder",
      "home",
      "builder",
      "home software",
      "home app",
      "home platform",
      "home system",
      "home management",
      "construction home"
  ],

  synonyms: [
      "Home Builder platform",
      "Home Builder software",
      "Home Builder system",
      "home solution",
      "home service"
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
      "project-bids",
      "daily-logs",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "subcontractor-mgmt",
      "material-takeoffs",
      "invoicing",
      "documents",
      "site-safety"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a home builder platform",
      "Create a home builder app",
      "I need a home builder management system",
      "Build a home builder solution",
      "Create a home builder booking system"
  ],
};
