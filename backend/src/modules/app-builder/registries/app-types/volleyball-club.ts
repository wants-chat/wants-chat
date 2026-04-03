/**
 * Volleyball Club App Type Definition
 *
 * Complete definition for volleyball club applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOLLEYBALL_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'volleyball-club',
  name: 'Volleyball Club',
  category: 'services',
  description: 'Volleyball Club platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "volleyball club",
      "volleyball",
      "club",
      "volleyball software",
      "volleyball app",
      "volleyball platform",
      "volleyball system",
      "volleyball management",
      "services volleyball"
  ],

  synonyms: [
      "Volleyball Club platform",
      "Volleyball Club software",
      "Volleyball Club system",
      "volleyball solution",
      "volleyball service"
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
      "Build a volleyball club platform",
      "Create a volleyball club app",
      "I need a volleyball club management system",
      "Build a volleyball club solution",
      "Create a volleyball club booking system"
  ],
};
