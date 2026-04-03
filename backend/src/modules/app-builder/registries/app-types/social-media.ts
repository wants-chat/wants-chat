/**
 * Social Media App Type Definition
 *
 * Complete definition for social media applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOCIAL_MEDIA_APP_TYPE: AppTypeDefinition = {
  id: 'social-media',
  name: 'Social Media',
  category: 'services',
  description: 'Social Media platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "social media",
      "social",
      "media",
      "social software",
      "social app",
      "social platform",
      "social system",
      "social management",
      "services social"
  ],

  synonyms: [
      "Social Media platform",
      "Social Media software",
      "Social Media system",
      "social solution",
      "social service"
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
      "Build a social media platform",
      "Create a social media app",
      "I need a social media management system",
      "Build a social media solution",
      "Create a social media booking system"
  ],
};
