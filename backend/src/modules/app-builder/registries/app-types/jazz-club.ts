/**
 * Jazz Club App Type Definition
 *
 * Complete definition for jazz club applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const JAZZ_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'jazz-club',
  name: 'Jazz Club',
  category: 'services',
  description: 'Jazz Club platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "jazz club",
      "jazz",
      "club",
      "jazz software",
      "jazz app",
      "jazz platform",
      "jazz system",
      "jazz management",
      "services jazz"
  ],

  synonyms: [
      "Jazz Club platform",
      "Jazz Club software",
      "Jazz Club system",
      "jazz solution",
      "jazz service"
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
      "Build a jazz club platform",
      "Create a jazz club app",
      "I need a jazz club management system",
      "Build a jazz club solution",
      "Create a jazz club booking system"
  ],
};
