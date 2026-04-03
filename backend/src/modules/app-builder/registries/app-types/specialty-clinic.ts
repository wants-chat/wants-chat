/**
 * Specialty Clinic App Type Definition
 *
 * Complete definition for specialty clinic applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPECIALTY_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'specialty-clinic',
  name: 'Specialty Clinic',
  category: 'healthcare',
  description: 'Specialty Clinic platform with comprehensive management features',
  icon: 'clinic',

  keywords: [
      "specialty clinic",
      "specialty",
      "clinic",
      "specialty software",
      "specialty app",
      "specialty platform",
      "specialty system",
      "specialty management",
      "healthcare specialty"
  ],

  synonyms: [
      "Specialty Clinic platform",
      "Specialty Clinic software",
      "Specialty Clinic system",
      "specialty solution",
      "specialty service"
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
      "Build a specialty clinic platform",
      "Create a specialty clinic app",
      "I need a specialty clinic management system",
      "Build a specialty clinic solution",
      "Create a specialty clinic booking system"
  ],
};
