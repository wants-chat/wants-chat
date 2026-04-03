/**
 * Voicemail App Type Definition
 *
 * Complete definition for voicemail applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOICEMAIL_APP_TYPE: AppTypeDefinition = {
  id: 'voicemail',
  name: 'Voicemail',
  category: 'services',
  description: 'Voicemail platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "voicemail",
      "voicemail software",
      "voicemail app",
      "voicemail platform",
      "voicemail system",
      "voicemail management",
      "services voicemail"
  ],

  synonyms: [
      "Voicemail platform",
      "Voicemail software",
      "Voicemail system",
      "voicemail solution",
      "voicemail service"
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
      "Build a voicemail platform",
      "Create a voicemail app",
      "I need a voicemail management system",
      "Build a voicemail solution",
      "Create a voicemail booking system"
  ],
};
