/**
 * Temporary Staffing App Type Definition
 *
 * Complete definition for temporary staffing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEMPORARY_STAFFING_APP_TYPE: AppTypeDefinition = {
  id: 'temporary-staffing',
  name: 'Temporary Staffing',
  category: 'services',
  description: 'Temporary Staffing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "temporary staffing",
      "temporary",
      "staffing",
      "temporary software",
      "temporary app",
      "temporary platform",
      "temporary system",
      "temporary management",
      "services temporary"
  ],

  synonyms: [
      "Temporary Staffing platform",
      "Temporary Staffing software",
      "Temporary Staffing system",
      "temporary solution",
      "temporary service"
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
      "Build a temporary staffing platform",
      "Create a temporary staffing app",
      "I need a temporary staffing management system",
      "Build a temporary staffing solution",
      "Create a temporary staffing booking system"
  ],
};
