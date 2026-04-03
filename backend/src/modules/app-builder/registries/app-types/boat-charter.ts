/**
 * Boat Charter App Type Definition
 *
 * Complete definition for boat charter applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOAT_CHARTER_APP_TYPE: AppTypeDefinition = {
  id: 'boat-charter',
  name: 'Boat Charter',
  category: 'services',
  description: 'Boat Charter platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "boat charter",
      "boat",
      "charter",
      "boat software",
      "boat app",
      "boat platform",
      "boat system",
      "boat management",
      "services boat"
  ],

  synonyms: [
      "Boat Charter platform",
      "Boat Charter software",
      "Boat Charter system",
      "boat solution",
      "boat service"
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
      "Build a boat charter platform",
      "Create a boat charter app",
      "I need a boat charter management system",
      "Build a boat charter solution",
      "Create a boat charter booking system"
  ],
};
