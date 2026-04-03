/**
 * Workplace Safety App Type Definition
 *
 * Complete definition for workplace safety applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORKPLACE_SAFETY_APP_TYPE: AppTypeDefinition = {
  id: 'workplace-safety',
  name: 'Workplace Safety',
  category: 'services',
  description: 'Workplace Safety platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "workplace safety",
      "workplace",
      "safety",
      "workplace software",
      "workplace app",
      "workplace platform",
      "workplace system",
      "workplace management",
      "services workplace"
  ],

  synonyms: [
      "Workplace Safety platform",
      "Workplace Safety software",
      "Workplace Safety system",
      "workplace solution",
      "workplace service"
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
      "Build a workplace safety platform",
      "Create a workplace safety app",
      "I need a workplace safety management system",
      "Build a workplace safety solution",
      "Create a workplace safety booking system"
  ],
};
