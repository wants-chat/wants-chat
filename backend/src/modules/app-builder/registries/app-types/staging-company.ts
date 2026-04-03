/**
 * Staging Company App Type Definition
 *
 * Complete definition for staging company applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STAGING_COMPANY_APP_TYPE: AppTypeDefinition = {
  id: 'staging-company',
  name: 'Staging Company',
  category: 'services',
  description: 'Staging Company platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "staging company",
      "staging",
      "company",
      "staging software",
      "staging app",
      "staging platform",
      "staging system",
      "staging management",
      "services staging"
  ],

  synonyms: [
      "Staging Company platform",
      "Staging Company software",
      "Staging Company system",
      "staging solution",
      "staging service"
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
      "Build a staging company platform",
      "Create a staging company app",
      "I need a staging company management system",
      "Build a staging company solution",
      "Create a staging company booking system"
  ],
};
