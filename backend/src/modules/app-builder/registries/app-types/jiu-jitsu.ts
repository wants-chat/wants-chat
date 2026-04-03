/**
 * Jiu Jitsu App Type Definition
 *
 * Complete definition for jiu jitsu applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const JIU_JITSU_APP_TYPE: AppTypeDefinition = {
  id: 'jiu-jitsu',
  name: 'Jiu Jitsu',
  category: 'services',
  description: 'Jiu Jitsu platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "jiu jitsu",
      "jiu",
      "jitsu",
      "jiu software",
      "jiu app",
      "jiu platform",
      "jiu system",
      "jiu management",
      "services jiu"
  ],

  synonyms: [
      "Jiu Jitsu platform",
      "Jiu Jitsu software",
      "Jiu Jitsu system",
      "jiu solution",
      "jiu service"
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
      "Build a jiu jitsu platform",
      "Create a jiu jitsu app",
      "I need a jiu jitsu management system",
      "Build a jiu jitsu solution",
      "Create a jiu jitsu booking system"
  ],
};
