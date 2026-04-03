/**
 * Neurofeedback App Type Definition
 *
 * Complete definition for neurofeedback applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NEUROFEEDBACK_APP_TYPE: AppTypeDefinition = {
  id: 'neurofeedback',
  name: 'Neurofeedback',
  category: 'healthcare',
  description: 'Neurofeedback platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "neurofeedback",
      "neurofeedback software",
      "neurofeedback app",
      "neurofeedback platform",
      "neurofeedback system",
      "neurofeedback management",
      "healthcare neurofeedback"
  ],

  synonyms: [
      "Neurofeedback platform",
      "Neurofeedback software",
      "Neurofeedback system",
      "neurofeedback solution",
      "neurofeedback service"
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
      "Build a neurofeedback platform",
      "Create a neurofeedback app",
      "I need a neurofeedback management system",
      "Build a neurofeedback solution",
      "Create a neurofeedback booking system"
  ],
};
