/**
 * Prison Ministry App Type Definition
 *
 * Complete definition for prison ministry applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRISON_MINISTRY_APP_TYPE: AppTypeDefinition = {
  id: 'prison-ministry',
  name: 'Prison Ministry',
  category: 'nonprofit',
  description: 'Prison Ministry platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "prison ministry",
      "prison",
      "ministry",
      "prison software",
      "prison app",
      "prison platform",
      "prison system",
      "prison management",
      "nonprofit prison"
  ],

  synonyms: [
      "Prison Ministry platform",
      "Prison Ministry software",
      "Prison Ministry system",
      "prison solution",
      "prison service"
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
      "Build a prison ministry platform",
      "Create a prison ministry app",
      "I need a prison ministry management system",
      "Build a prison ministry solution",
      "Create a prison ministry booking system"
  ],
};
