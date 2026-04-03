/**
 * Reclaimed Wood App Type Definition
 *
 * Complete definition for reclaimed wood applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RECLAIMED_WOOD_APP_TYPE: AppTypeDefinition = {
  id: 'reclaimed-wood',
  name: 'Reclaimed Wood',
  category: 'services',
  description: 'Reclaimed Wood platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "reclaimed wood",
      "reclaimed",
      "wood",
      "reclaimed software",
      "reclaimed app",
      "reclaimed platform",
      "reclaimed system",
      "reclaimed management",
      "services reclaimed"
  ],

  synonyms: [
      "Reclaimed Wood platform",
      "Reclaimed Wood software",
      "Reclaimed Wood system",
      "reclaimed solution",
      "reclaimed service"
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
      "Build a reclaimed wood platform",
      "Create a reclaimed wood app",
      "I need a reclaimed wood management system",
      "Build a reclaimed wood solution",
      "Create a reclaimed wood booking system"
  ],
};
