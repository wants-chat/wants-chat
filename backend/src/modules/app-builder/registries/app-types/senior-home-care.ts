/**
 * Senior Home Care App Type Definition
 *
 * Complete definition for senior home care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_HOME_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'senior-home-care',
  name: 'Senior Home Care',
  category: 'healthcare',
  description: 'Senior Home Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "senior home care",
      "senior",
      "home",
      "care",
      "senior software",
      "senior app",
      "senior platform",
      "senior system",
      "senior management",
      "healthcare senior"
  ],

  synonyms: [
      "Senior Home Care platform",
      "Senior Home Care software",
      "Senior Home Care system",
      "senior solution",
      "senior service"
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
      "Build a senior home care platform",
      "Create a senior home care app",
      "I need a senior home care management system",
      "Build a senior home care solution",
      "Create a senior home care booking system"
  ],
};
