/**
 * Sports Psychology App Type Definition
 *
 * Complete definition for sports psychology applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTS_PSYCHOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'sports-psychology',
  name: 'Sports Psychology',
  category: 'healthcare',
  description: 'Sports Psychology platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "sports psychology",
      "sports",
      "psychology",
      "sports software",
      "sports app",
      "sports platform",
      "sports system",
      "sports management",
      "healthcare sports"
  ],

  synonyms: [
      "Sports Psychology platform",
      "Sports Psychology software",
      "Sports Psychology system",
      "sports solution",
      "sports service"
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
      "Build a sports psychology platform",
      "Create a sports psychology app",
      "I need a sports psychology management system",
      "Build a sports psychology solution",
      "Create a sports psychology booking system"
  ],
};
