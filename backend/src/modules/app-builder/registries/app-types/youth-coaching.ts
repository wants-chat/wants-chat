/**
 * Youth Coaching App Type Definition
 *
 * Complete definition for youth coaching applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOUTH_COACHING_APP_TYPE: AppTypeDefinition = {
  id: 'youth-coaching',
  name: 'Youth Coaching',
  category: 'professional-services',
  description: 'Youth Coaching platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "youth coaching",
      "youth",
      "coaching",
      "youth software",
      "youth app",
      "youth platform",
      "youth system",
      "youth management",
      "consulting youth"
  ],

  synonyms: [
      "Youth Coaching platform",
      "Youth Coaching software",
      "Youth Coaching system",
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
      "appointments",
      "clients",
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a youth coaching platform",
      "Create a youth coaching app",
      "I need a youth coaching management system",
      "Build a youth coaching solution",
      "Create a youth coaching booking system"
  ],
};
