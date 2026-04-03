/**
 * News Media App Type Definition
 *
 * Complete definition for news media applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NEWS_MEDIA_APP_TYPE: AppTypeDefinition = {
  id: 'news-media',
  name: 'News Media',
  category: 'services',
  description: 'News Media platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "news media",
      "news",
      "media",
      "news software",
      "news app",
      "news platform",
      "news system",
      "news management",
      "services news"
  ],

  synonyms: [
      "News Media platform",
      "News Media software",
      "News Media system",
      "news solution",
      "news service"
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
      "Build a news media platform",
      "Create a news media app",
      "I need a news media management system",
      "Build a news media solution",
      "Create a news media booking system"
  ],
};
