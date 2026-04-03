/**
 * Skin Clinic App Type Definition
 *
 * Complete definition for skin clinic applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKIN_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'skin-clinic',
  name: 'Skin Clinic',
  category: 'healthcare',
  description: 'Skin Clinic platform with comprehensive management features',
  icon: 'clinic',

  keywords: [
      "skin clinic",
      "skin",
      "clinic",
      "skin software",
      "skin app",
      "skin platform",
      "skin system",
      "skin management",
      "healthcare skin"
  ],

  synonyms: [
      "Skin Clinic platform",
      "Skin Clinic software",
      "Skin Clinic system",
      "skin solution",
      "skin service"
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
      "Build a skin clinic platform",
      "Create a skin clinic app",
      "I need a skin clinic management system",
      "Build a skin clinic solution",
      "Create a skin clinic booking system"
  ],
};
