/**
 * Outsourcing App Type Definition
 *
 * Complete definition for outsourcing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OUTSOURCING_APP_TYPE: AppTypeDefinition = {
  id: 'outsourcing',
  name: 'Outsourcing',
  category: 'services',
  description: 'Outsourcing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "outsourcing",
      "outsourcing software",
      "outsourcing app",
      "outsourcing platform",
      "outsourcing system",
      "outsourcing management",
      "services outsourcing"
  ],

  synonyms: [
      "Outsourcing platform",
      "Outsourcing software",
      "Outsourcing system",
      "outsourcing solution",
      "outsourcing service"
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
      "Build a outsourcing platform",
      "Create a outsourcing app",
      "I need a outsourcing management system",
      "Build a outsourcing solution",
      "Create a outsourcing booking system"
  ],
};
