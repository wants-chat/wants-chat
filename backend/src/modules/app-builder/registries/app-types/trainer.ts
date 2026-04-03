/**
 * Trainer App Type Definition
 *
 * Complete definition for trainer applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAINER_APP_TYPE: AppTypeDefinition = {
  id: 'trainer',
  name: 'Trainer',
  category: 'services',
  description: 'Trainer platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "trainer",
      "trainer software",
      "trainer app",
      "trainer platform",
      "trainer system",
      "trainer management",
      "services trainer"
  ],

  synonyms: [
      "Trainer platform",
      "Trainer software",
      "Trainer system",
      "trainer solution",
      "trainer service"
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
      "Build a trainer platform",
      "Create a trainer app",
      "I need a trainer management system",
      "Build a trainer solution",
      "Create a trainer booking system"
  ],
};
