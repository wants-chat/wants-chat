/**
 * Software Support App Type Definition
 *
 * Complete definition for software support applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOFTWARE_SUPPORT_APP_TYPE: AppTypeDefinition = {
  id: 'software-support',
  name: 'Software Support',
  category: 'technology',
  description: 'Software Support platform with comprehensive management features',
  icon: 'laptop',

  keywords: [
      "software support",
      "software",
      "support",
      "software software",
      "software app",
      "software platform",
      "software system",
      "software management",
      "technology software"
  ],

  synonyms: [
      "Software Support platform",
      "Software Support software",
      "Software Support system",
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
      "Build a software support platform",
      "Create a software support app",
      "I need a software support management system",
      "Build a software support solution",
      "Create a software support booking system"
  ],
};
