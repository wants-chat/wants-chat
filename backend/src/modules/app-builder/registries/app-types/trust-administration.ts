/**
 * Trust Administration App Type Definition
 *
 * Complete definition for trust administration applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRUST_ADMINISTRATION_APP_TYPE: AppTypeDefinition = {
  id: 'trust-administration',
  name: 'Trust Administration',
  category: 'services',
  description: 'Trust Administration platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "trust administration",
      "trust",
      "administration",
      "trust software",
      "trust app",
      "trust platform",
      "trust system",
      "trust management",
      "services trust"
  ],

  synonyms: [
      "Trust Administration platform",
      "Trust Administration software",
      "Trust Administration system",
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
      "Build a trust administration platform",
      "Create a trust administration app",
      "I need a trust administration management system",
      "Build a trust administration solution",
      "Create a trust administration booking system"
  ],
};
