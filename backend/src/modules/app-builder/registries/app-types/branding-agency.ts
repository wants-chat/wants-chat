/**
 * Branding Agency App Type Definition
 *
 * Complete definition for branding agency applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BRANDING_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'branding-agency',
  name: 'Branding Agency',
  category: 'services',
  description: 'Branding Agency platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "branding agency",
      "branding",
      "agency",
      "branding software",
      "branding app",
      "branding platform",
      "branding system",
      "branding management",
      "services branding"
  ],

  synonyms: [
      "Branding Agency platform",
      "Branding Agency software",
      "Branding Agency system",
      "branding solution",
      "branding service"
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
      "Build a branding agency platform",
      "Create a branding agency app",
      "I need a branding agency management system",
      "Build a branding agency solution",
      "Create a branding agency booking system"
  ],
};
