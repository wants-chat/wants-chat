/**
 * Talent Scout App Type Definition
 *
 * Complete definition for talent scout applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TALENT_SCOUT_APP_TYPE: AppTypeDefinition = {
  id: 'talent-scout',
  name: 'Talent Scout',
  category: 'services',
  description: 'Talent Scout platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "talent scout",
      "talent",
      "scout",
      "talent software",
      "talent app",
      "talent platform",
      "talent system",
      "talent management",
      "services talent"
  ],

  synonyms: [
      "Talent Scout platform",
      "Talent Scout software",
      "Talent Scout system",
      "talent solution",
      "talent service"
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
      "Build a talent scout platform",
      "Create a talent scout app",
      "I need a talent scout management system",
      "Build a talent scout solution",
      "Create a talent scout booking system"
  ],
};
