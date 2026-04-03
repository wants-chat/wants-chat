/**
 * Turn Around App Type Definition
 *
 * Complete definition for turn around applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TURN_AROUND_APP_TYPE: AppTypeDefinition = {
  id: 'turn-around',
  name: 'Turn Around',
  category: 'services',
  description: 'Turn Around platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "turn around",
      "turn",
      "around",
      "turn software",
      "turn app",
      "turn platform",
      "turn system",
      "turn management",
      "services turn"
  ],

  synonyms: [
      "Turn Around platform",
      "Turn Around software",
      "Turn Around system",
      "turn solution",
      "turn service"
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
      "Build a turn around platform",
      "Create a turn around app",
      "I need a turn around management system",
      "Build a turn around solution",
      "Create a turn around booking system"
  ],
};
