/**
 * Stage Lighting App Type Definition
 *
 * Complete definition for stage lighting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STAGE_LIGHTING_APP_TYPE: AppTypeDefinition = {
  id: 'stage-lighting',
  name: 'Stage Lighting',
  category: 'services',
  description: 'Stage Lighting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "stage lighting",
      "stage",
      "lighting",
      "stage software",
      "stage app",
      "stage platform",
      "stage system",
      "stage management",
      "services stage"
  ],

  synonyms: [
      "Stage Lighting platform",
      "Stage Lighting software",
      "Stage Lighting system",
      "stage solution",
      "stage service"
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
      "Build a stage lighting platform",
      "Create a stage lighting app",
      "I need a stage lighting management system",
      "Build a stage lighting solution",
      "Create a stage lighting booking system"
  ],
};
