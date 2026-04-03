/**
 * Squash Club App Type Definition
 *
 * Complete definition for squash club applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SQUASH_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'squash-club',
  name: 'Squash Club',
  category: 'services',
  description: 'Squash Club platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "squash club",
      "squash",
      "club",
      "squash software",
      "squash app",
      "squash platform",
      "squash system",
      "squash management",
      "services squash"
  ],

  synonyms: [
      "Squash Club platform",
      "Squash Club software",
      "Squash Club system",
      "squash solution",
      "squash service"
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
      "Build a squash club platform",
      "Create a squash club app",
      "I need a squash club management system",
      "Build a squash club solution",
      "Create a squash club booking system"
  ],
};
