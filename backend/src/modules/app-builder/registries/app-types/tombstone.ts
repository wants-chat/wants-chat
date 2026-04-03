/**
 * Tombstone App Type Definition
 *
 * Complete definition for tombstone applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOMBSTONE_APP_TYPE: AppTypeDefinition = {
  id: 'tombstone',
  name: 'Tombstone',
  category: 'services',
  description: 'Tombstone platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tombstone",
      "tombstone software",
      "tombstone app",
      "tombstone platform",
      "tombstone system",
      "tombstone management",
      "services tombstone"
  ],

  synonyms: [
      "Tombstone platform",
      "Tombstone software",
      "Tombstone system",
      "tombstone solution",
      "tombstone service"
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
      "Build a tombstone platform",
      "Create a tombstone app",
      "I need a tombstone management system",
      "Build a tombstone solution",
      "Create a tombstone booking system"
  ],
};
