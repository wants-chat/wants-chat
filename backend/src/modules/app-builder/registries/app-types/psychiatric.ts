/**
 * Psychiatric App Type Definition
 *
 * Complete definition for psychiatric applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PSYCHIATRIC_APP_TYPE: AppTypeDefinition = {
  id: 'psychiatric',
  name: 'Psychiatric',
  category: 'healthcare',
  description: 'Psychiatric platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "psychiatric",
      "psychiatric software",
      "psychiatric app",
      "psychiatric platform",
      "psychiatric system",
      "psychiatric management",
      "healthcare psychiatric"
  ],

  synonyms: [
      "Psychiatric platform",
      "Psychiatric software",
      "Psychiatric system",
      "psychiatric solution",
      "psychiatric service"
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
      "Build a psychiatric platform",
      "Create a psychiatric app",
      "I need a psychiatric management system",
      "Build a psychiatric solution",
      "Create a psychiatric booking system"
  ],
};
