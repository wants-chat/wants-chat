/**
 * Placement Agency App Type Definition
 *
 * Complete definition for placement agency applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PLACEMENT_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'placement-agency',
  name: 'Placement Agency',
  category: 'services',
  description: 'Placement Agency platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "placement agency",
      "placement",
      "agency",
      "placement software",
      "placement app",
      "placement platform",
      "placement system",
      "placement management",
      "services placement"
  ],

  synonyms: [
      "Placement Agency platform",
      "Placement Agency software",
      "Placement Agency system",
      "placement solution",
      "placement service"
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
      "Build a placement agency platform",
      "Create a placement agency app",
      "I need a placement agency management system",
      "Build a placement agency solution",
      "Create a placement agency booking system"
  ],
};
