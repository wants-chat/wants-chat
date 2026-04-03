/**
 * Online Community App Type Definition
 *
 * Complete definition for online community applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_COMMUNITY_APP_TYPE: AppTypeDefinition = {
  id: 'online-community',
  name: 'Online Community',
  category: 'community',
  description: 'Online Community platform with comprehensive management features',
  icon: 'users',

  keywords: [
      "online community",
      "online",
      "community",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "community online"
  ],

  synonyms: [
      "Online Community platform",
      "Online Community software",
      "Online Community system",
      "online solution",
      "online service"
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
      "announcements",
      "calendar",
      "messaging",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "blog",
      "gallery",
      "feedback",
      "documents"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'medium',
  industry: 'community',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
      "Build a online community platform",
      "Create a online community app",
      "I need a online community management system",
      "Build a online community solution",
      "Create a online community booking system"
  ],
};
