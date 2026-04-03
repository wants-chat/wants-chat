/**
 * Homework Help App Type Definition
 *
 * Complete definition for homework help applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOMEWORK_HELP_APP_TYPE: AppTypeDefinition = {
  id: 'homework-help',
  name: 'Homework Help',
  category: 'services',
  description: 'Homework Help platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "homework help",
      "homework",
      "help",
      "homework software",
      "homework app",
      "homework platform",
      "homework system",
      "homework management",
      "services homework"
  ],

  synonyms: [
      "Homework Help platform",
      "Homework Help software",
      "Homework Help system",
      "homework solution",
      "homework service"
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
      "Build a homework help platform",
      "Create a homework help app",
      "I need a homework help management system",
      "Build a homework help solution",
      "Create a homework help booking system"
  ],
};
