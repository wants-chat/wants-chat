/**
 * Mentoring App Type Definition
 *
 * Complete definition for mentoring applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MENTORING_APP_TYPE: AppTypeDefinition = {
  id: 'mentoring',
  name: 'Mentoring',
  category: 'professional-services',
  description: 'Mentoring platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "mentoring",
      "mentoring software",
      "mentoring app",
      "mentoring platform",
      "mentoring system",
      "mentoring management",
      "consulting mentoring"
  ],

  synonyms: [
      "Mentoring platform",
      "Mentoring software",
      "Mentoring system",
      "mentoring solution",
      "mentoring service"
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
      "Build a mentoring platform",
      "Create a mentoring app",
      "I need a mentoring management system",
      "Build a mentoring solution",
      "Create a mentoring booking system"
  ],
};
