/**
 * Supervision App Type Definition
 *
 * Complete definition for supervision applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUPERVISION_APP_TYPE: AppTypeDefinition = {
  id: 'supervision',
  name: 'Supervision',
  category: 'services',
  description: 'Supervision platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "supervision",
      "supervision software",
      "supervision app",
      "supervision platform",
      "supervision system",
      "supervision management",
      "services supervision"
  ],

  synonyms: [
      "Supervision platform",
      "Supervision software",
      "Supervision system",
      "supervision solution",
      "supervision service"
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
      "Build a supervision platform",
      "Create a supervision app",
      "I need a supervision management system",
      "Build a supervision solution",
      "Create a supervision booking system"
  ],
};
