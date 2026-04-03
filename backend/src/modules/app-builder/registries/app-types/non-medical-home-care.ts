/**
 * Non Medical Home Care App Type Definition
 *
 * Complete definition for non medical home care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NON_MEDICAL_HOME_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'non-medical-home-care',
  name: 'Non Medical Home Care',
  category: 'healthcare',
  description: 'Non Medical Home Care platform with comprehensive management features',
  icon: 'medical',

  keywords: [
      "non medical home care",
      "non",
      "medical",
      "home",
      "care",
      "non software",
      "non app",
      "non platform",
      "non system",
      "non management",
      "healthcare non"
  ],

  synonyms: [
      "Non Medical Home Care platform",
      "Non Medical Home Care software",
      "Non Medical Home Care system",
      "non solution",
      "non service"
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
      "lab-results",
      "vital-signs",
      "referrals"
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
      "Build a non medical home care platform",
      "Create a non medical home care app",
      "I need a non medical home care management system",
      "Build a non medical home care solution",
      "Create a non medical home care booking system"
  ],
};
