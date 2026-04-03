/**
 * Medical Spa App Type Definition
 *
 * Complete definition for medical spa applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEDICAL_SPA_APP_TYPE: AppTypeDefinition = {
  id: 'medical-spa',
  name: 'Medical Spa',
  category: 'healthcare',
  description: 'Medical Spa platform with comprehensive management features',
  icon: 'medical',

  keywords: [
      "medical spa",
      "medical",
      "spa",
      "medical software",
      "medical app",
      "medical platform",
      "medical system",
      "medical management",
      "healthcare medical"
  ],

  synonyms: [
      "Medical Spa platform",
      "Medical Spa software",
      "Medical Spa system",
      "medical solution",
      "medical service"
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
      "Build a medical spa platform",
      "Create a medical spa app",
      "I need a medical spa management system",
      "Build a medical spa solution",
      "Create a medical spa booking system"
  ],
};
