/**
 * Website Hosting App Type Definition
 *
 * Complete definition for website hosting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEBSITE_HOSTING_APP_TYPE: AppTypeDefinition = {
  id: 'website-hosting',
  name: 'Website Hosting',
  category: 'technology',
  description: 'Website Hosting platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "website hosting",
      "website",
      "hosting",
      "website software",
      "website app",
      "website platform",
      "website system",
      "website management",
      "technology website"
  ],

  synonyms: [
      "Website Hosting platform",
      "Website Hosting software",
      "Website Hosting system",
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
      "Build a website hosting platform",
      "Create a website hosting app",
      "I need a website hosting management system",
      "Build a website hosting solution",
      "Create a website hosting booking system"
  ],
};
