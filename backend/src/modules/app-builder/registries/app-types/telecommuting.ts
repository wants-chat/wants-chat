/**
 * Telecommuting App Type Definition
 *
 * Complete definition for telecommuting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TELECOMMUTING_APP_TYPE: AppTypeDefinition = {
  id: 'telecommuting',
  name: 'Telecommuting',
  category: 'services',
  description: 'Telecommuting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "telecommuting",
      "telecommuting software",
      "telecommuting app",
      "telecommuting platform",
      "telecommuting system",
      "telecommuting management",
      "services telecommuting"
  ],

  synonyms: [
      "Telecommuting platform",
      "Telecommuting software",
      "Telecommuting system",
      "telecommuting solution",
      "telecommuting service"
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
      "Build a telecommuting platform",
      "Create a telecommuting app",
      "I need a telecommuting management system",
      "Build a telecommuting solution",
      "Create a telecommuting booking system"
  ],
};
