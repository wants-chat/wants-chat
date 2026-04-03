/**
 * Skating Lessons App Type Definition
 *
 * Complete definition for skating lessons applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKATING_LESSONS_APP_TYPE: AppTypeDefinition = {
  id: 'skating-lessons',
  name: 'Skating Lessons',
  category: 'services',
  description: 'Skating Lessons platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "skating lessons",
      "skating",
      "lessons",
      "skating software",
      "skating app",
      "skating platform",
      "skating system",
      "skating management",
      "services skating"
  ],

  synonyms: [
      "Skating Lessons platform",
      "Skating Lessons software",
      "Skating Lessons system",
      "skating solution",
      "skating service"
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
      "Build a skating lessons platform",
      "Create a skating lessons app",
      "I need a skating lessons management system",
      "Build a skating lessons solution",
      "Create a skating lessons booking system"
  ],
};
