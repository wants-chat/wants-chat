/**
 * Work Release App Type Definition
 *
 * Complete definition for work release applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORK_RELEASE_APP_TYPE: AppTypeDefinition = {
  id: 'work-release',
  name: 'Work Release',
  category: 'real-estate',
  description: 'Work Release platform with comprehensive management features',
  icon: 'home',

  keywords: [
      "work release",
      "work",
      "release",
      "work software",
      "work app",
      "work platform",
      "work system",
      "work management",
      "real-estate work"
  ],

  synonyms: [
      "Work Release platform",
      "Work Release software",
      "Work Release system",
      "work solution",
      "work service"
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
          "name": "Broker",
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
          "name": "Agent",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Client",
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
      "property-listings",
      "showing-management",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "virtual-tours",
      "mls-integration",
      "property-valuation",
      "clients",
      "crm"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'real-estate',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a work release platform",
      "Create a work release app",
      "I need a work release management system",
      "Build a work release solution",
      "Create a work release booking system"
  ],
};
