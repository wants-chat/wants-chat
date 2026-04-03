/**
 * Site Management App Type Definition
 *
 * Complete definition for site management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SITE_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'site-management',
  name: 'Site Management',
  category: 'services',
  description: 'Site Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "site management",
      "site",
      "management",
      "site software",
      "site app",
      "site platform",
      "site system",
      "services site"
  ],

  synonyms: [
      "Site Management platform",
      "Site Management software",
      "Site Management system",
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
      "Build a site management platform",
      "Create a site management app",
      "I need a site management management system",
      "Build a site management solution",
      "Create a site management booking system"
  ],
};
