/**
 * Orthopedic App Type Definition
 *
 * Complete definition for orthopedic applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ORTHOPEDIC_APP_TYPE: AppTypeDefinition = {
  id: 'orthopedic',
  name: 'Orthopedic',
  category: 'healthcare',
  description: 'Orthopedic platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "orthopedic",
      "orthopedic software",
      "orthopedic app",
      "orthopedic platform",
      "orthopedic system",
      "orthopedic management",
      "healthcare orthopedic"
  ],

  synonyms: [
      "Orthopedic platform",
      "Orthopedic software",
      "Orthopedic system",
      "orthopedic solution",
      "orthopedic service"
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
      "Build a orthopedic platform",
      "Create a orthopedic app",
      "I need a orthopedic management system",
      "Build a orthopedic solution",
      "Create a orthopedic booking system"
  ],
};
