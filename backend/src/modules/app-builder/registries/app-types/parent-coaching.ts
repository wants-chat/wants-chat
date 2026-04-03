/**
 * Parent Coaching App Type Definition
 *
 * Complete definition for parent coaching applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PARENT_COACHING_APP_TYPE: AppTypeDefinition = {
  id: 'parent-coaching',
  name: 'Parent Coaching',
  category: 'professional-services',
  description: 'Parent Coaching platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "parent coaching",
      "parent",
      "coaching",
      "parent software",
      "parent app",
      "parent platform",
      "parent system",
      "parent management",
      "consulting parent"
  ],

  synonyms: [
      "Parent Coaching platform",
      "Parent Coaching software",
      "Parent Coaching system",
      "parent solution",
      "parent service"
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
      "Build a parent coaching platform",
      "Create a parent coaching app",
      "I need a parent coaching management system",
      "Build a parent coaching solution",
      "Create a parent coaching booking system"
  ],
};
