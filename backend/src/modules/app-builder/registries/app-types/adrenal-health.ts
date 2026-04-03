/**
 * Adrenal Health App Type Definition
 *
 * Complete definition for adrenal health applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ADRENAL_HEALTH_APP_TYPE: AppTypeDefinition = {
  id: 'adrenal-health',
  name: 'Adrenal Health',
  category: 'healthcare',
  description: 'Adrenal Health platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "adrenal health",
      "adrenal",
      "health",
      "adrenal software",
      "adrenal app",
      "adrenal platform",
      "adrenal system",
      "adrenal management",
      "healthcare adrenal"
  ],

  synonyms: [
      "Adrenal Health platform",
      "Adrenal Health software",
      "Adrenal Health system",
      "adrenal solution",
      "adrenal service"
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
      "Build a adrenal health platform",
      "Create a adrenal health app",
      "I need a adrenal health management system",
      "Build a adrenal health solution",
      "Create a adrenal health booking system"
  ],
};
