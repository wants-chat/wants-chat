/**
 * Hindu Temple App Type Definition
 *
 * Complete definition for hindu temple applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HINDU_TEMPLE_APP_TYPE: AppTypeDefinition = {
  id: 'hindu-temple',
  name: 'Hindu Temple',
  category: 'nonprofit',
  description: 'Hindu Temple platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "hindu temple",
      "hindu",
      "temple",
      "hindu software",
      "hindu app",
      "hindu platform",
      "hindu system",
      "hindu management",
      "nonprofit hindu"
  ],

  synonyms: [
      "Hindu Temple platform",
      "Hindu Temple software",
      "Hindu Temple system",
      "hindu solution",
      "hindu service"
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
      "Build a hindu temple platform",
      "Create a hindu temple app",
      "I need a hindu temple management system",
      "Build a hindu temple solution",
      "Create a hindu temple booking system"
  ],
};
