/**
 * Nursing Agency App Type Definition
 *
 * Complete definition for nursing agency applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NURSING_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'nursing-agency',
  name: 'Nursing Agency',
  category: 'services',
  description: 'Nursing Agency platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "nursing agency",
      "nursing",
      "agency",
      "nursing software",
      "nursing app",
      "nursing platform",
      "nursing system",
      "nursing management",
      "services nursing"
  ],

  synonyms: [
      "Nursing Agency platform",
      "Nursing Agency software",
      "Nursing Agency system",
      "nursing solution",
      "nursing service"
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
      "Build a nursing agency platform",
      "Create a nursing agency app",
      "I need a nursing agency management system",
      "Build a nursing agency solution",
      "Create a nursing agency booking system"
  ],
};
