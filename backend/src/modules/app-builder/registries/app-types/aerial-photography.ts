/**
 * Aerial Photography App Type Definition
 *
 * Complete definition for aerial photography applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AERIAL_PHOTOGRAPHY_APP_TYPE: AppTypeDefinition = {
  id: 'aerial-photography',
  name: 'Aerial Photography',
  category: 'services',
  description: 'Aerial Photography platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "aerial photography",
      "aerial",
      "photography",
      "aerial software",
      "aerial app",
      "aerial platform",
      "aerial system",
      "aerial management",
      "services aerial"
  ],

  synonyms: [
      "Aerial Photography platform",
      "Aerial Photography software",
      "Aerial Photography system",
      "aerial solution",
      "aerial service"
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
      "Build a aerial photography platform",
      "Create a aerial photography app",
      "I need a aerial photography management system",
      "Build a aerial photography solution",
      "Create a aerial photography booking system"
  ],
};
