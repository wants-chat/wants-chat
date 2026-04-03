/**
 * Title Company App Type Definition
 *
 * Complete definition for title company applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TITLE_COMPANY_APP_TYPE: AppTypeDefinition = {
  id: 'title-company',
  name: 'Title Company',
  category: 'services',
  description: 'Title Company platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "title company",
      "title",
      "company",
      "title software",
      "title app",
      "title platform",
      "title system",
      "title management",
      "services title"
  ],

  synonyms: [
      "Title Company platform",
      "Title Company software",
      "Title Company system",
      "title solution",
      "title service"
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
      "Build a title company platform",
      "Create a title company app",
      "I need a title company management system",
      "Build a title company solution",
      "Create a title company booking system"
  ],
};
