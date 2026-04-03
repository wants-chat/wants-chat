/**
 * Recovery Coaching App Type Definition
 *
 * Complete definition for recovery coaching applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RECOVERY_COACHING_APP_TYPE: AppTypeDefinition = {
  id: 'recovery-coaching',
  name: 'Recovery Coaching',
  category: 'professional-services',
  description: 'Recovery Coaching platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "recovery coaching",
      "recovery",
      "coaching",
      "recovery software",
      "recovery app",
      "recovery platform",
      "recovery system",
      "recovery management",
      "consulting recovery"
  ],

  synonyms: [
      "Recovery Coaching platform",
      "Recovery Coaching software",
      "Recovery Coaching system",
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
      "clients",
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a recovery coaching platform",
      "Create a recovery coaching app",
      "I need a recovery coaching management system",
      "Build a recovery coaching solution",
      "Create a recovery coaching booking system"
  ],
};
