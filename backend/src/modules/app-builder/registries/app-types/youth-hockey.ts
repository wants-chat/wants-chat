/**
 * Youth Hockey App Type Definition
 *
 * Complete definition for youth hockey applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOUTH_HOCKEY_APP_TYPE: AppTypeDefinition = {
  id: 'youth-hockey',
  name: 'Youth Hockey',
  category: 'services',
  description: 'Youth Hockey platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "youth hockey",
      "youth",
      "hockey",
      "youth software",
      "youth app",
      "youth platform",
      "youth system",
      "youth management",
      "services youth"
  ],

  synonyms: [
      "Youth Hockey platform",
      "Youth Hockey software",
      "Youth Hockey system",
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
      "Build a youth hockey platform",
      "Create a youth hockey app",
      "I need a youth hockey management system",
      "Build a youth hockey solution",
      "Create a youth hockey booking system"
  ],
};
