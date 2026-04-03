/**
 * Youth Ministry App Type Definition
 *
 * Complete definition for youth ministry applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOUTH_MINISTRY_APP_TYPE: AppTypeDefinition = {
  id: 'youth-ministry',
  name: 'Youth Ministry',
  category: 'nonprofit',
  description: 'Youth Ministry platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "youth ministry",
      "youth",
      "ministry",
      "youth software",
      "youth app",
      "youth platform",
      "youth system",
      "youth management",
      "nonprofit youth"
  ],

  synonyms: [
      "Youth Ministry platform",
      "Youth Ministry software",
      "Youth Ministry system",
      "youth solution",
      "youth service"
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
      "Build a youth ministry platform",
      "Create a youth ministry app",
      "I need a youth ministry management system",
      "Build a youth ministry solution",
      "Create a youth ministry booking system"
  ],
};
