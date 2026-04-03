/**
 * Fertility Clinic App Type Definition
 *
 * Complete definition for fertility clinic applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FERTILITY_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'fertility-clinic',
  name: 'Fertility Clinic',
  category: 'healthcare',
  description: 'Fertility Clinic platform with comprehensive management features',
  icon: 'clinic',

  keywords: [
      "fertility clinic",
      "fertility",
      "clinic",
      "fertility software",
      "fertility app",
      "fertility platform",
      "fertility system",
      "fertility management",
      "healthcare fertility"
  ],

  synonyms: [
      "Fertility Clinic platform",
      "Fertility Clinic software",
      "Fertility Clinic system",
      "fertility solution",
      "fertility service"
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
      "check-in",
      "notifications"
  ],

  optionalFeatures: [
      "insurance-billing",
      "prescriptions",
      "telemedicine",
      "payments",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a fertility clinic platform",
      "Create a fertility clinic app",
      "I need a fertility clinic management system",
      "Build a fertility clinic solution",
      "Create a fertility clinic booking system"
  ],
};
