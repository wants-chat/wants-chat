/**
 * Site Preparation App Type Definition
 *
 * Complete definition for site preparation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SITE_PREPARATION_APP_TYPE: AppTypeDefinition = {
  id: 'site-preparation',
  name: 'Site Preparation',
  category: 'services',
  description: 'Site Preparation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "site preparation",
      "site",
      "preparation",
      "site software",
      "site app",
      "site platform",
      "site system",
      "site management",
      "services site"
  ],

  synonyms: [
      "Site Preparation platform",
      "Site Preparation software",
      "Site Preparation system",
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
      "Build a site preparation platform",
      "Create a site preparation app",
      "I need a site preparation management system",
      "Build a site preparation solution",
      "Create a site preparation booking system"
  ],
};
