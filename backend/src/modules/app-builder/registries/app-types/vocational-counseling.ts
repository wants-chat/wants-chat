/**
 * Vocational Counseling App Type Definition
 *
 * Complete definition for vocational counseling applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOCATIONAL_COUNSELING_APP_TYPE: AppTypeDefinition = {
  id: 'vocational-counseling',
  name: 'Vocational Counseling',
  category: 'services',
  description: 'Vocational Counseling platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vocational counseling",
      "vocational",
      "counseling",
      "vocational software",
      "vocational app",
      "vocational platform",
      "vocational system",
      "vocational management",
      "services vocational"
  ],

  synonyms: [
      "Vocational Counseling platform",
      "Vocational Counseling software",
      "Vocational Counseling system",
      "vocational solution",
      "vocational service"
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
      "Build a vocational counseling platform",
      "Create a vocational counseling app",
      "I need a vocational counseling management system",
      "Build a vocational counseling solution",
      "Create a vocational counseling booking system"
  ],
};
