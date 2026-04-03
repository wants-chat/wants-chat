/**
 * Software Licensing App Type Definition
 *
 * Complete definition for software licensing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOFTWARE_LICENSING_APP_TYPE: AppTypeDefinition = {
  id: 'software-licensing',
  name: 'Software Licensing',
  category: 'technology',
  description: 'Software Licensing platform with comprehensive management features',
  icon: 'laptop',

  keywords: [
      "software licensing",
      "software",
      "licensing",
      "software software",
      "software app",
      "software platform",
      "software system",
      "software management",
      "technology software"
  ],

  synonyms: [
      "Software Licensing platform",
      "Software Licensing software",
      "Software Licensing system",
      "software solution",
      "software service"
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

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a software licensing platform",
      "Create a software licensing app",
      "I need a software licensing management system",
      "Build a software licensing solution",
      "Create a software licensing booking system"
  ],
};
