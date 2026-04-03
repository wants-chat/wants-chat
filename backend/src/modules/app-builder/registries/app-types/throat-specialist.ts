/**
 * Throat Specialist App Type Definition
 *
 * Complete definition for throat specialist applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THROAT_SPECIALIST_APP_TYPE: AppTypeDefinition = {
  id: 'throat-specialist',
  name: 'Throat Specialist',
  category: 'services',
  description: 'Throat Specialist platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "throat specialist",
      "throat",
      "specialist",
      "throat software",
      "throat app",
      "throat platform",
      "throat system",
      "throat management",
      "services throat"
  ],

  synonyms: [
      "Throat Specialist platform",
      "Throat Specialist software",
      "Throat Specialist system",
      "throat solution",
      "throat service"
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
      "Build a throat specialist platform",
      "Create a throat specialist app",
      "I need a throat specialist management system",
      "Build a throat specialist solution",
      "Create a throat specialist booking system"
  ],
};
