/**
 * Youth Club App Type Definition
 *
 * Complete definition for youth club applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOUTH_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'youth-club',
  name: 'Youth Club',
  category: 'services',
  description: 'Youth Club platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "youth club",
      "youth",
      "club",
      "youth software",
      "youth app",
      "youth platform",
      "youth system",
      "youth management",
      "services youth"
  ],

  synonyms: [
      "Youth Club platform",
      "Youth Club software",
      "Youth Club system",
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
      "Build a youth club platform",
      "Create a youth club app",
      "I need a youth club management system",
      "Build a youth club solution",
      "Create a youth club booking system"
  ],
};
