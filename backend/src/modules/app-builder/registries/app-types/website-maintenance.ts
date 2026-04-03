/**
 * Website Maintenance App Type Definition
 *
 * Complete definition for website maintenance applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEBSITE_MAINTENANCE_APP_TYPE: AppTypeDefinition = {
  id: 'website-maintenance',
  name: 'Website Maintenance',
  category: 'technology',
  description: 'Website Maintenance platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "website maintenance",
      "website",
      "maintenance",
      "website software",
      "website app",
      "website platform",
      "website system",
      "website management",
      "technology website"
  ],

  synonyms: [
      "Website Maintenance platform",
      "Website Maintenance software",
      "Website Maintenance system",
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
      "Build a website maintenance platform",
      "Create a website maintenance app",
      "I need a website maintenance management system",
      "Build a website maintenance solution",
      "Create a website maintenance booking system"
  ],
};
