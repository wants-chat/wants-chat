/**
 * Creative Agency App Type Definition
 *
 * Complete definition for creative agency applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CREATIVE_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'creative-agency',
  name: 'Creative Agency',
  category: 'services',
  description: 'Creative Agency platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "creative agency",
      "creative",
      "agency",
      "creative software",
      "creative app",
      "creative platform",
      "creative system",
      "creative management",
      "services creative"
  ],

  synonyms: [
      "Creative Agency platform",
      "Creative Agency software",
      "Creative Agency system",
      "creative solution",
      "creative service"
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
      "Build a creative agency platform",
      "Create a creative agency app",
      "I need a creative agency management system",
      "Build a creative agency solution",
      "Create a creative agency booking system"
  ],
};
