/**
 * Paramedic App Type Definition
 *
 * Complete definition for paramedic applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PARAMEDIC_APP_TYPE: AppTypeDefinition = {
  id: 'paramedic',
  name: 'Paramedic',
  category: 'services',
  description: 'Paramedic platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "paramedic",
      "paramedic software",
      "paramedic app",
      "paramedic platform",
      "paramedic system",
      "paramedic management",
      "services paramedic"
  ],

  synonyms: [
      "Paramedic platform",
      "Paramedic software",
      "Paramedic system",
      "paramedic solution",
      "paramedic service"
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
      "Build a paramedic platform",
      "Create a paramedic app",
      "I need a paramedic management system",
      "Build a paramedic solution",
      "Create a paramedic booking system"
  ],
};
