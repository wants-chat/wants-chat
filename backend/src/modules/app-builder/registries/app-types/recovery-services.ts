/**
 * Recovery Services App Type Definition
 *
 * Complete definition for recovery services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RECOVERY_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'recovery-services',
  name: 'Recovery Services',
  category: 'services',
  description: 'Recovery Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "recovery services",
      "recovery",
      "services",
      "recovery software",
      "recovery app",
      "recovery platform",
      "recovery system",
      "recovery management",
      "services recovery"
  ],

  synonyms: [
      "Recovery Services platform",
      "Recovery Services software",
      "Recovery Services system",
      "recovery solution",
      "recovery service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a recovery services platform",
      "Create a recovery services app",
      "I need a recovery services management system",
      "Build a recovery services solution",
      "Create a recovery services booking system"
  ],
};
