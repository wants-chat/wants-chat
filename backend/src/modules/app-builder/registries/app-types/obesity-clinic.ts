/**
 * Obesity Clinic App Type Definition
 *
 * Complete definition for obesity clinic applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OBESITY_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'obesity-clinic',
  name: 'Obesity Clinic',
  category: 'healthcare',
  description: 'Obesity Clinic platform with comprehensive management features',
  icon: 'clinic',

  keywords: [
      "obesity clinic",
      "obesity",
      "clinic",
      "obesity software",
      "obesity app",
      "obesity platform",
      "obesity system",
      "obesity management",
      "healthcare obesity"
  ],

  synonyms: [
      "Obesity Clinic platform",
      "Obesity Clinic software",
      "Obesity Clinic system",
      "obesity solution",
      "obesity service"
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
      "Build a obesity clinic platform",
      "Create a obesity clinic app",
      "I need a obesity clinic management system",
      "Build a obesity clinic solution",
      "Create a obesity clinic booking system"
  ],
};
