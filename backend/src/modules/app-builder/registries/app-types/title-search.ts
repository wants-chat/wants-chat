/**
 * Title Search App Type Definition
 *
 * Complete definition for title search applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TITLE_SEARCH_APP_TYPE: AppTypeDefinition = {
  id: 'title-search',
  name: 'Title Search',
  category: 'services',
  description: 'Title Search platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "title search",
      "title",
      "search",
      "title software",
      "title app",
      "title platform",
      "title system",
      "title management",
      "services title"
  ],

  synonyms: [
      "Title Search platform",
      "Title Search software",
      "Title Search system",
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
      "Build a title search platform",
      "Create a title search app",
      "I need a title search management system",
      "Build a title search solution",
      "Create a title search booking system"
  ],
};
