/**
 * Pediatrics App Type Definition
 *
 * Complete definition for pediatrics applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PEDIATRICS_APP_TYPE: AppTypeDefinition = {
  id: 'pediatrics',
  name: 'Pediatrics',
  category: 'healthcare',
  description: 'Pediatrics platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "pediatrics",
      "pediatrics software",
      "pediatrics app",
      "pediatrics platform",
      "pediatrics system",
      "pediatrics management",
      "healthcare pediatrics"
  ],

  synonyms: [
      "Pediatrics platform",
      "Pediatrics software",
      "Pediatrics system",
      "pediatrics solution",
      "pediatrics service"
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
      "Build a pediatrics platform",
      "Create a pediatrics app",
      "I need a pediatrics management system",
      "Build a pediatrics solution",
      "Create a pediatrics booking system"
  ],
};
