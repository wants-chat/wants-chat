/**
 * Vein Clinic App Type Definition
 *
 * Complete definition for vein clinic applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VEIN_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'vein-clinic',
  name: 'Vein Clinic',
  category: 'healthcare',
  description: 'Vein Clinic platform with comprehensive management features',
  icon: 'clinic',

  keywords: [
      "vein clinic",
      "vein",
      "clinic",
      "vein software",
      "vein app",
      "vein platform",
      "vein system",
      "vein management",
      "healthcare vein"
  ],

  synonyms: [
      "Vein Clinic platform",
      "Vein Clinic software",
      "Vein Clinic system",
      "vein solution",
      "vein service"
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
      "Build a vein clinic platform",
      "Create a vein clinic app",
      "I need a vein clinic management system",
      "Build a vein clinic solution",
      "Create a vein clinic booking system"
  ],
};
