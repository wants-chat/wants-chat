/**
 * Crime Scene Cleanup App Type Definition
 *
 * Complete definition for crime scene cleanup applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CRIME_SCENE_CLEANUP_APP_TYPE: AppTypeDefinition = {
  id: 'crime-scene-cleanup',
  name: 'Crime Scene Cleanup',
  category: 'services',
  description: 'Crime Scene Cleanup platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "crime scene cleanup",
      "crime",
      "scene",
      "cleanup",
      "crime software",
      "crime app",
      "crime platform",
      "crime system",
      "crime management",
      "services crime"
  ],

  synonyms: [
      "Crime Scene Cleanup platform",
      "Crime Scene Cleanup software",
      "Crime Scene Cleanup system",
      "crime solution",
      "crime service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a crime scene cleanup platform",
      "Create a crime scene cleanup app",
      "I need a crime scene cleanup management system",
      "Build a crime scene cleanup solution",
      "Create a crime scene cleanup booking system"
  ],
};
