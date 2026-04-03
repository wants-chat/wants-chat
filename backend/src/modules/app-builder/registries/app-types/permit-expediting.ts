/**
 * Permit Expediting App Type Definition
 *
 * Complete definition for permit expediting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PERMIT_EXPEDITING_APP_TYPE: AppTypeDefinition = {
  id: 'permit-expediting',
  name: 'Permit Expediting',
  category: 'technology',
  description: 'Permit Expediting platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "permit expediting",
      "permit",
      "expediting",
      "permit software",
      "permit app",
      "permit platform",
      "permit system",
      "permit management",
      "technology permit"
  ],

  synonyms: [
      "Permit Expediting platform",
      "Permit Expediting software",
      "Permit Expediting system",
      "permit solution",
      "permit service"
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
      "projects",
      "tasks",
      "documents",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "time-tracking",
      "invoicing",
      "clients",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a permit expediting platform",
      "Create a permit expediting app",
      "I need a permit expediting management system",
      "Build a permit expediting solution",
      "Create a permit expediting booking system"
  ],
};
