/**
 * Wedding Music App Type Definition
 *
 * Complete definition for wedding music applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEDDING_MUSIC_APP_TYPE: AppTypeDefinition = {
  id: 'wedding-music',
  name: 'Wedding Music',
  category: 'entertainment',
  description: 'Wedding Music platform with comprehensive management features',
  icon: 'music',

  keywords: [
      "wedding music",
      "wedding",
      "music",
      "wedding software",
      "wedding app",
      "wedding platform",
      "wedding system",
      "wedding management",
      "entertainment wedding"
  ],

  synonyms: [
      "Wedding Music platform",
      "Wedding Music software",
      "Wedding Music system",
      "wedding solution",
      "wedding service"
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
      "media",
      "gallery",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "ticket-sales",
      "subscriptions",
      "payments",
      "reviews",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'entertainment',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'creative',

  examplePrompts: [
      "Build a wedding music platform",
      "Create a wedding music app",
      "I need a wedding music management system",
      "Build a wedding music solution",
      "Create a wedding music booking system"
  ],
};
