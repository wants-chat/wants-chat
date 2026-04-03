/**
 * Healthcare It App Type Definition
 *
 * Complete definition for healthcare it applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HEALTHCARE_IT_APP_TYPE: AppTypeDefinition = {
  id: 'healthcare-it',
  name: 'Healthcare It',
  category: 'healthcare',
  description: 'Healthcare It platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "healthcare it",
      "healthcare",
      "healthcare software",
      "healthcare app",
      "healthcare platform",
      "healthcare system",
      "healthcare management",
      "healthcare healthcare"
  ],

  synonyms: [
      "Healthcare It platform",
      "Healthcare It software",
      "Healthcare It system",
      "healthcare solution",
      "healthcare service"
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
      "Build a healthcare it platform",
      "Create a healthcare it app",
      "I need a healthcare it management system",
      "Build a healthcare it solution",
      "Create a healthcare it booking system"
  ],
};
