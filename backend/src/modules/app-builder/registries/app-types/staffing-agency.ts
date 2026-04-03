/**
 * Staffing Agency App Type Definition
 *
 * Complete definition for staffing agency applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STAFFING_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'staffing-agency',
  name: 'Staffing Agency',
  category: 'services',
  description: 'Staffing Agency platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "staffing agency",
      "staffing",
      "agency",
      "staffing software",
      "staffing app",
      "staffing platform",
      "staffing system",
      "staffing management",
      "services staffing"
  ],

  synonyms: [
      "Staffing Agency platform",
      "Staffing Agency software",
      "Staffing Agency system",
      "staffing solution",
      "staffing service"
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
      "Build a staffing agency platform",
      "Create a staffing agency app",
      "I need a staffing agency management system",
      "Build a staffing agency solution",
      "Create a staffing agency booking system"
  ],
};
