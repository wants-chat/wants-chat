/**
 * Wildlife Photography App Type Definition
 *
 * Complete definition for wildlife photography applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WILDLIFE_PHOTOGRAPHY_APP_TYPE: AppTypeDefinition = {
  id: 'wildlife-photography',
  name: 'Wildlife Photography',
  category: 'services',
  description: 'Wildlife Photography platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wildlife photography",
      "wildlife",
      "photography",
      "wildlife software",
      "wildlife app",
      "wildlife platform",
      "wildlife system",
      "wildlife management",
      "services wildlife"
  ],

  synonyms: [
      "Wildlife Photography platform",
      "Wildlife Photography software",
      "Wildlife Photography system",
      "wildlife solution",
      "wildlife service"
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
      "Build a wildlife photography platform",
      "Create a wildlife photography app",
      "I need a wildlife photography management system",
      "Build a wildlife photography solution",
      "Create a wildlife photography booking system"
  ],
};
