/**
 * Performance Coaching App Type Definition
 *
 * Complete definition for performance coaching applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PERFORMANCE_COACHING_APP_TYPE: AppTypeDefinition = {
  id: 'performance-coaching',
  name: 'Performance Coaching',
  category: 'professional-services',
  description: 'Performance Coaching platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "performance coaching",
      "performance",
      "coaching",
      "performance software",
      "performance app",
      "performance platform",
      "performance system",
      "performance management",
      "consulting performance"
  ],

  synonyms: [
      "Performance Coaching platform",
      "Performance Coaching software",
      "Performance Coaching system",
      "performance solution",
      "performance service"
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
      "Build a performance coaching platform",
      "Create a performance coaching app",
      "I need a performance coaching management system",
      "Build a performance coaching solution",
      "Create a performance coaching booking system"
  ],
};
