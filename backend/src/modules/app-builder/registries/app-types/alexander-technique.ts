/**
 * Alexander Technique App Type Definition
 *
 * Complete definition for alexander technique applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALEXANDER_TECHNIQUE_APP_TYPE: AppTypeDefinition = {
  id: 'alexander-technique',
  name: 'Alexander Technique',
  category: 'technology',
  description: 'Alexander Technique platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "alexander technique",
      "alexander",
      "technique",
      "alexander software",
      "alexander app",
      "alexander platform",
      "alexander system",
      "alexander management",
      "technology alexander"
  ],

  synonyms: [
      "Alexander Technique platform",
      "Alexander Technique software",
      "Alexander Technique system",
      "alexander solution",
      "alexander service"
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
      "Build a alexander technique platform",
      "Create a alexander technique app",
      "I need a alexander technique management system",
      "Build a alexander technique solution",
      "Create a alexander technique booking system"
  ],
};
