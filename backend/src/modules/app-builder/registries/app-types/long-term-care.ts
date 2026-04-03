/**
 * Long Term Care App Type Definition
 *
 * Complete definition for long term care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LONG_TERM_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'long-term-care',
  name: 'Long Term Care',
  category: 'healthcare',
  description: 'Long Term Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "long term care",
      "long",
      "term",
      "care",
      "long software",
      "long app",
      "long platform",
      "long system",
      "long management",
      "healthcare long"
  ],

  synonyms: [
      "Long Term Care platform",
      "Long Term Care software",
      "Long Term Care system",
      "long solution",
      "long service"
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
          "name": "Practice Owner",
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
          "name": "Healthcare Provider",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Patient",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/appointments"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "patient-records",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "telemedicine",
      "prescriptions",
      "insurance-billing",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a long term care platform",
      "Create a long term care app",
      "I need a long term care management system",
      "Build a long term care solution",
      "Create a long term care booking system"
  ],
};
