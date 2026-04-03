/**
 * Singing Lessons App Type Definition
 *
 * Complete definition for singing lessons applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SINGING_LESSONS_APP_TYPE: AppTypeDefinition = {
  id: 'singing-lessons',
  name: 'Singing Lessons',
  category: 'services',
  description: 'Singing Lessons platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "singing lessons",
      "singing",
      "lessons",
      "singing software",
      "singing app",
      "singing platform",
      "singing system",
      "singing management",
      "services singing"
  ],

  synonyms: [
      "Singing Lessons platform",
      "Singing Lessons software",
      "Singing Lessons system",
      "singing solution",
      "singing service"
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
      "Build a singing lessons platform",
      "Create a singing lessons app",
      "I need a singing lessons management system",
      "Build a singing lessons solution",
      "Create a singing lessons booking system"
  ],
};
