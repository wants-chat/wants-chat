/**
 * Ankle Bracelet App Type Definition
 *
 * Complete definition for ankle bracelet applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANKLE_BRACELET_APP_TYPE: AppTypeDefinition = {
  id: 'ankle-bracelet',
  name: 'Ankle Bracelet',
  category: 'services',
  description: 'Ankle Bracelet platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ankle bracelet",
      "ankle",
      "bracelet",
      "ankle software",
      "ankle app",
      "ankle platform",
      "ankle system",
      "ankle management",
      "services ankle"
  ],

  synonyms: [
      "Ankle Bracelet platform",
      "Ankle Bracelet software",
      "Ankle Bracelet system",
      "ankle solution",
      "ankle service"
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
      "Build a ankle bracelet platform",
      "Create a ankle bracelet app",
      "I need a ankle bracelet management system",
      "Build a ankle bracelet solution",
      "Create a ankle bracelet booking system"
  ],
};
