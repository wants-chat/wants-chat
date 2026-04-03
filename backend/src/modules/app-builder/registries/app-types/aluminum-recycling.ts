/**
 * Aluminum Recycling App Type Definition
 *
 * Complete definition for aluminum recycling applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALUMINUM_RECYCLING_APP_TYPE: AppTypeDefinition = {
  id: 'aluminum-recycling',
  name: 'Aluminum Recycling',
  category: 'services',
  description: 'Aluminum Recycling platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "aluminum recycling",
      "aluminum",
      "recycling",
      "aluminum software",
      "aluminum app",
      "aluminum platform",
      "aluminum system",
      "aluminum management",
      "services aluminum"
  ],

  synonyms: [
      "Aluminum Recycling platform",
      "Aluminum Recycling software",
      "Aluminum Recycling system",
      "aluminum solution",
      "aluminum service"
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
      "Build a aluminum recycling platform",
      "Create a aluminum recycling app",
      "I need a aluminum recycling management system",
      "Build a aluminum recycling solution",
      "Create a aluminum recycling booking system"
  ],
};
