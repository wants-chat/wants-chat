/**
 * Surgical Center App Type Definition
 *
 * Complete definition for surgical center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SURGICAL_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'surgical-center',
  name: 'Surgical Center',
  category: 'services',
  description: 'Surgical Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "surgical center",
      "surgical",
      "center",
      "surgical software",
      "surgical app",
      "surgical platform",
      "surgical system",
      "surgical management",
      "services surgical"
  ],

  synonyms: [
      "Surgical Center platform",
      "Surgical Center software",
      "Surgical Center system",
      "surgical solution",
      "surgical service"
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
      "Build a surgical center platform",
      "Create a surgical center app",
      "I need a surgical center management system",
      "Build a surgical center solution",
      "Create a surgical center booking system"
  ],
};
