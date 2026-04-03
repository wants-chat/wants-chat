/**
 * Wave Pool App Type Definition
 *
 * Complete definition for wave pool applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WAVE_POOL_APP_TYPE: AppTypeDefinition = {
  id: 'wave-pool',
  name: 'Wave Pool',
  category: 'services',
  description: 'Wave Pool platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wave pool",
      "wave",
      "pool",
      "wave software",
      "wave app",
      "wave platform",
      "wave system",
      "wave management",
      "services wave"
  ],

  synonyms: [
      "Wave Pool platform",
      "Wave Pool software",
      "Wave Pool system",
      "wave solution",
      "wave service"
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
      "Build a wave pool platform",
      "Create a wave pool app",
      "I need a wave pool management system",
      "Build a wave pool solution",
      "Create a wave pool booking system"
  ],
};
