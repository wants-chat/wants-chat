/**
 * Pro Audio App Type Definition
 *
 * Complete definition for pro audio applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRO_AUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'pro-audio',
  name: 'Pro Audio',
  category: 'services',
  description: 'Pro Audio platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "pro audio",
      "pro",
      "audio",
      "pro software",
      "pro app",
      "pro platform",
      "pro system",
      "pro management",
      "services pro"
  ],

  synonyms: [
      "Pro Audio platform",
      "Pro Audio software",
      "Pro Audio system",
      "pro solution",
      "pro service"
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
      "Build a pro audio platform",
      "Create a pro audio app",
      "I need a pro audio management system",
      "Build a pro audio solution",
      "Create a pro audio booking system"
  ],
};
