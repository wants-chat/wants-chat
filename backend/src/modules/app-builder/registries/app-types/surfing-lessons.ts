/**
 * Surfing Lessons App Type Definition
 *
 * Complete definition for surfing lessons applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SURFING_LESSONS_APP_TYPE: AppTypeDefinition = {
  id: 'surfing-lessons',
  name: 'Surfing Lessons',
  category: 'services',
  description: 'Surfing Lessons platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "surfing lessons",
      "surfing",
      "lessons",
      "surfing software",
      "surfing app",
      "surfing platform",
      "surfing system",
      "surfing management",
      "services surfing"
  ],

  synonyms: [
      "Surfing Lessons platform",
      "Surfing Lessons software",
      "Surfing Lessons system",
      "surfing solution",
      "surfing service"
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
      "Build a surfing lessons platform",
      "Create a surfing lessons app",
      "I need a surfing lessons management system",
      "Build a surfing lessons solution",
      "Create a surfing lessons booking system"
  ],
};
