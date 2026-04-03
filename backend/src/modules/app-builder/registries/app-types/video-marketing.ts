/**
 * Video Marketing App Type Definition
 *
 * Complete definition for video marketing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIDEO_MARKETING_APP_TYPE: AppTypeDefinition = {
  id: 'video-marketing',
  name: 'Video Marketing',
  category: 'retail',
  description: 'Video Marketing platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "video marketing",
      "video",
      "marketing",
      "video software",
      "video app",
      "video platform",
      "video system",
      "video management",
      "retail video"
  ],

  synonyms: [
      "Video Marketing platform",
      "Video Marketing software",
      "Video Marketing system",
      "video solution",
      "video service"
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
      "product-catalog",
      "orders",
      "pos-system",
      "inventory",
      "notifications"
  ],

  optionalFeatures: [
      "payments",
      "discounts",
      "reviews",
      "analytics",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'retail',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a video marketing platform",
      "Create a video marketing app",
      "I need a video marketing management system",
      "Build a video marketing solution",
      "Create a video marketing booking system"
  ],
};
