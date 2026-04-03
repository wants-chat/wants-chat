/**
 * Website Builder App Type Definition
 *
 * Complete definition for website builder applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEBSITE_BUILDER_APP_TYPE: AppTypeDefinition = {
  id: 'website-builder',
  name: 'Website Builder',
  category: 'construction',
  description: 'Website Builder platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "website builder",
      "website",
      "builder",
      "website software",
      "website app",
      "website platform",
      "website system",
      "website management",
      "construction website"
  ],

  synonyms: [
      "Website Builder platform",
      "Website Builder software",
      "Website Builder system",
      "website solution",
      "website service"
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
      "Build a website builder platform",
      "Create a website builder app",
      "I need a website builder management system",
      "Build a website builder solution",
      "Create a website builder booking system"
  ],
};
