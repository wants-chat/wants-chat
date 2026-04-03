/**
 * Voice Services App Type Definition
 *
 * Complete definition for voice services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOICE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'voice-services',
  name: 'Voice Services',
  category: 'services',
  description: 'Voice Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "voice services",
      "voice",
      "services",
      "voice software",
      "voice app",
      "voice platform",
      "voice system",
      "voice management",
      "services voice"
  ],

  synonyms: [
      "Voice Services platform",
      "Voice Services software",
      "Voice Services system",
      "voice solution",
      "voice service"
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
      "Build a voice services platform",
      "Create a voice services app",
      "I need a voice services management system",
      "Build a voice services solution",
      "Create a voice services booking system"
  ],
};
