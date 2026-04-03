/**
 * Urology Clinic App Type Definition
 *
 * Complete definition for urology clinic applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UROLOGY_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'urology-clinic',
  name: 'Urology Clinic',
  category: 'healthcare',
  description: 'Urology Clinic platform with comprehensive management features',
  icon: 'clinic',

  keywords: [
      "urology clinic",
      "urology",
      "clinic",
      "urology software",
      "urology app",
      "urology platform",
      "urology system",
      "urology management",
      "healthcare urology"
  ],

  synonyms: [
      "Urology Clinic platform",
      "Urology Clinic software",
      "Urology Clinic system",
      "urology solution",
      "urology service"
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
      "Build a urology clinic platform",
      "Create a urology clinic app",
      "I need a urology clinic management system",
      "Build a urology clinic solution",
      "Create a urology clinic booking system"
  ],
};
