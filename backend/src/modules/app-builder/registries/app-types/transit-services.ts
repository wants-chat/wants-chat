/**
 * Transit Services App Type Definition
 *
 * Complete definition for transit services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRANSIT_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'transit-services',
  name: 'Transit Services',
  category: 'technology',
  description: 'Transit Services platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "transit services",
      "transit",
      "services",
      "transit software",
      "transit app",
      "transit platform",
      "transit system",
      "transit management",
      "technology transit"
  ],

  synonyms: [
      "Transit Services platform",
      "Transit Services software",
      "Transit Services system",
      "transit solution",
      "transit service"
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
      "projects",
      "tasks",
      "documents",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "time-tracking",
      "invoicing",
      "clients",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a transit services platform",
      "Create a transit services app",
      "I need a transit services management system",
      "Build a transit services solution",
      "Create a transit services booking system"
  ],
};
