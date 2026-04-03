/**
 * Portrait Photography App Type Definition
 *
 * Complete definition for portrait photography applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PORTRAIT_PHOTOGRAPHY_APP_TYPE: AppTypeDefinition = {
  id: 'portrait-photography',
  name: 'Portrait Photography',
  category: 'technology',
  description: 'Portrait Photography platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "portrait photography",
      "portrait",
      "photography",
      "portrait software",
      "portrait app",
      "portrait platform",
      "portrait system",
      "portrait management",
      "technology portrait"
  ],

  synonyms: [
      "Portrait Photography platform",
      "Portrait Photography software",
      "Portrait Photography system",
      "portrait solution",
      "portrait service"
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
      "projects",
      "tasks",
      "documents",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "time-tracking",
      "invoicing",
      "clients",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a portrait photography platform",
      "Create a portrait photography app",
      "I need a portrait photography management system",
      "Build a portrait photography solution",
      "Create a portrait photography booking system"
  ],
};
