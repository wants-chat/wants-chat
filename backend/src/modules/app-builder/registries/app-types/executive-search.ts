/**
 * Executive Search App Type Definition
 *
 * Complete definition for executive search applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EXECUTIVE_SEARCH_APP_TYPE: AppTypeDefinition = {
  id: 'executive-search',
  name: 'Executive Search',
  category: 'services',
  description: 'Executive Search platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "executive search",
      "executive",
      "search",
      "executive software",
      "executive app",
      "executive platform",
      "executive system",
      "executive management",
      "services executive"
  ],

  synonyms: [
      "Executive Search platform",
      "Executive Search software",
      "Executive Search system",
      "executive solution",
      "executive service"
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
      "Build a executive search platform",
      "Create a executive search app",
      "I need a executive search management system",
      "Build a executive search solution",
      "Create a executive search booking system"
  ],
};
