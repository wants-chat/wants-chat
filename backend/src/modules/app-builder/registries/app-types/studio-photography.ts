/**
 * Studio Photography App Type Definition
 *
 * Complete definition for studio photography applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STUDIO_PHOTOGRAPHY_APP_TYPE: AppTypeDefinition = {
  id: 'studio-photography',
  name: 'Studio Photography',
  category: 'services',
  description: 'Studio Photography platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "studio photography",
      "studio",
      "photography",
      "studio software",
      "studio app",
      "studio platform",
      "studio system",
      "studio management",
      "services studio"
  ],

  synonyms: [
      "Studio Photography platform",
      "Studio Photography software",
      "Studio Photography system",
      "studio solution",
      "studio service"
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
      "Build a studio photography platform",
      "Create a studio photography app",
      "I need a studio photography management system",
      "Build a studio photography solution",
      "Create a studio photography booking system"
  ],
};
