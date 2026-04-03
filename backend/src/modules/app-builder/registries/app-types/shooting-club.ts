/**
 * Shooting Club App Type Definition
 *
 * Complete definition for shooting club applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHOOTING_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'shooting-club',
  name: 'Shooting Club',
  category: 'services',
  description: 'Shooting Club platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "shooting club",
      "shooting",
      "club",
      "shooting software",
      "shooting app",
      "shooting platform",
      "shooting system",
      "shooting management",
      "services shooting"
  ],

  synonyms: [
      "Shooting Club platform",
      "Shooting Club software",
      "Shooting Club system",
      "shooting solution",
      "shooting service"
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
      "Build a shooting club platform",
      "Create a shooting club app",
      "I need a shooting club management system",
      "Build a shooting club solution",
      "Create a shooting club booking system"
  ],
};
