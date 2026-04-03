/**
 * Veterinary Clinic App Type Definition
 *
 * Complete definition for veterinary clinic applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VETERINARY_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'veterinary-clinic',
  name: 'Veterinary Clinic',
  category: 'healthcare',
  description: 'Veterinary Clinic platform with comprehensive management features',
  icon: 'clinic',

  keywords: [
      "veterinary clinic",
      "veterinary",
      "clinic",
      "veterinary software",
      "veterinary app",
      "veterinary platform",
      "veterinary system",
      "veterinary management",
      "healthcare veterinary"
  ],

  synonyms: [
      "Veterinary Clinic platform",
      "Veterinary Clinic software",
      "Veterinary Clinic system",
      "veterinary solution",
      "veterinary service"
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
      "Build a veterinary clinic platform",
      "Create a veterinary clinic app",
      "I need a veterinary clinic management system",
      "Build a veterinary clinic solution",
      "Create a veterinary clinic booking system"
  ],
};
