/**
 * Robotics App Type Definition
 *
 * Complete definition for robotics applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ROBOTICS_APP_TYPE: AppTypeDefinition = {
  id: 'robotics',
  name: 'Robotics',
  category: 'services',
  description: 'Robotics platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "robotics",
      "robotics software",
      "robotics app",
      "robotics platform",
      "robotics system",
      "robotics management",
      "services robotics"
  ],

  synonyms: [
      "Robotics platform",
      "Robotics software",
      "Robotics system",
      "robotics solution",
      "robotics service"
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
      "Build a robotics platform",
      "Create a robotics app",
      "I need a robotics management system",
      "Build a robotics solution",
      "Create a robotics booking system"
  ],
};
