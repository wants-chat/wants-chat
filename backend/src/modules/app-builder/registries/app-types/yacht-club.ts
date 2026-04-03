/**
 * Yacht Club App Type Definition
 *
 * Complete definition for yacht club applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YACHT_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'yacht-club',
  name: 'Yacht Club',
  category: 'services',
  description: 'Yacht Club platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "yacht club",
      "yacht",
      "club",
      "yacht software",
      "yacht app",
      "yacht platform",
      "yacht system",
      "yacht management",
      "services yacht"
  ],

  synonyms: [
      "Yacht Club platform",
      "Yacht Club software",
      "Yacht Club system",
      "yacht solution",
      "yacht service"
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
      "Build a yacht club platform",
      "Create a yacht club app",
      "I need a yacht club management system",
      "Build a yacht club solution",
      "Create a yacht club booking system"
  ],
};
