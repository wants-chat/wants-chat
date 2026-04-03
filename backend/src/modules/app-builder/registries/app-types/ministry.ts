/**
 * Ministry App Type Definition
 *
 * Complete definition for ministry applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MINISTRY_APP_TYPE: AppTypeDefinition = {
  id: 'ministry',
  name: 'Ministry',
  category: 'nonprofit',
  description: 'Ministry platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "ministry",
      "ministry software",
      "ministry app",
      "ministry platform",
      "ministry system",
      "ministry management",
      "nonprofit ministry"
  ],

  synonyms: [
      "Ministry platform",
      "Ministry software",
      "Ministry system",
      "ministry solution",
      "ministry service"
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
      "crm",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "messaging",
      "blog",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'nonprofit',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'warm',

  examplePrompts: [
      "Build a ministry platform",
      "Create a ministry app",
      "I need a ministry management system",
      "Build a ministry solution",
      "Create a ministry booking system"
  ],
};
