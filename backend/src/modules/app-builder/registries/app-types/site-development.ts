/**
 * Site Development App Type Definition
 *
 * Complete definition for site development applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SITE_DEVELOPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'site-development',
  name: 'Site Development',
  category: 'services',
  description: 'Site Development platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "site development",
      "site",
      "development",
      "site software",
      "site app",
      "site platform",
      "site system",
      "site management",
      "services site"
  ],

  synonyms: [
      "Site Development platform",
      "Site Development software",
      "Site Development system",
      "site solution",
      "site service"
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
      "Build a site development platform",
      "Create a site development app",
      "I need a site development management system",
      "Build a site development solution",
      "Create a site development booking system"
  ],
};
