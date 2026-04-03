/**
 * Tie Dye App Type Definition
 *
 * Complete definition for tie dye applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TIE_DYE_APP_TYPE: AppTypeDefinition = {
  id: 'tie-dye',
  name: 'Tie Dye',
  category: 'services',
  description: 'Tie Dye platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tie dye",
      "tie",
      "dye",
      "tie software",
      "tie app",
      "tie platform",
      "tie system",
      "tie management",
      "services tie"
  ],

  synonyms: [
      "Tie Dye platform",
      "Tie Dye software",
      "Tie Dye system",
      "tie solution",
      "tie service"
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
      "Build a tie dye platform",
      "Create a tie dye app",
      "I need a tie dye management system",
      "Build a tie dye solution",
      "Create a tie dye booking system"
  ],
};
