/**
 * Vocal Lessons App Type Definition
 *
 * Complete definition for vocal lessons applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOCAL_LESSONS_APP_TYPE: AppTypeDefinition = {
  id: 'vocal-lessons',
  name: 'Vocal Lessons',
  category: 'services',
  description: 'Vocal Lessons platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vocal lessons",
      "vocal",
      "lessons",
      "vocal software",
      "vocal app",
      "vocal platform",
      "vocal system",
      "vocal management",
      "services vocal"
  ],

  synonyms: [
      "Vocal Lessons platform",
      "Vocal Lessons software",
      "Vocal Lessons system",
      "vocal solution",
      "vocal service"
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
      "Build a vocal lessons platform",
      "Create a vocal lessons app",
      "I need a vocal lessons management system",
      "Build a vocal lessons solution",
      "Create a vocal lessons booking system"
  ],
};
