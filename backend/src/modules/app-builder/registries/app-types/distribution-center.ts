/**
 * Distribution Center App Type Definition
 *
 * Complete definition for distribution center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DISTRIBUTION_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'distribution-center',
  name: 'Distribution Center',
  category: 'services',
  description: 'Distribution Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "distribution center",
      "distribution",
      "center",
      "distribution software",
      "distribution app",
      "distribution platform",
      "distribution system",
      "distribution management",
      "services distribution"
  ],

  synonyms: [
      "Distribution Center platform",
      "Distribution Center software",
      "Distribution Center system",
      "distribution solution",
      "distribution service"
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
      "Build a distribution center platform",
      "Create a distribution center app",
      "I need a distribution center management system",
      "Build a distribution center solution",
      "Create a distribution center booking system"
  ],
};
