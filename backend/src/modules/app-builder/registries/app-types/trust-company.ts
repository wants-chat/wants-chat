/**
 * Trust Company App Type Definition
 *
 * Complete definition for trust company applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRUST_COMPANY_APP_TYPE: AppTypeDefinition = {
  id: 'trust-company',
  name: 'Trust Company',
  category: 'services',
  description: 'Trust Company platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "trust company",
      "trust",
      "company",
      "trust software",
      "trust app",
      "trust platform",
      "trust system",
      "trust management",
      "services trust"
  ],

  synonyms: [
      "Trust Company platform",
      "Trust Company software",
      "Trust Company system",
      "trust solution",
      "trust service"
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
      "Build a trust company platform",
      "Create a trust company app",
      "I need a trust company management system",
      "Build a trust company solution",
      "Create a trust company booking system"
  ],
};
