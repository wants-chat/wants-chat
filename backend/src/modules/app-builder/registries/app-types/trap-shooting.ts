/**
 * Trap Shooting App Type Definition
 *
 * Complete definition for trap shooting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAP_SHOOTING_APP_TYPE: AppTypeDefinition = {
  id: 'trap-shooting',
  name: 'Trap Shooting',
  category: 'services',
  description: 'Trap Shooting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "trap shooting",
      "trap",
      "shooting",
      "trap software",
      "trap app",
      "trap platform",
      "trap system",
      "trap management",
      "services trap"
  ],

  synonyms: [
      "Trap Shooting platform",
      "Trap Shooting software",
      "Trap Shooting system",
      "trap solution",
      "trap service"
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
      "Build a trap shooting platform",
      "Create a trap shooting app",
      "I need a trap shooting management system",
      "Build a trap shooting solution",
      "Create a trap shooting booking system"
  ],
};
