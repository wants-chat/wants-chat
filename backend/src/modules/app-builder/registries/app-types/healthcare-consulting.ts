/**
 * Healthcare Consulting App Type Definition
 *
 * Complete definition for healthcare consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HEALTHCARE_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'healthcare-consulting',
  name: 'Healthcare Consulting',
  category: 'healthcare',
  description: 'Healthcare Consulting platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "healthcare consulting",
      "healthcare",
      "consulting",
      "healthcare software",
      "healthcare app",
      "healthcare platform",
      "healthcare system",
      "healthcare management",
      "healthcare healthcare"
  ],

  synonyms: [
      "Healthcare Consulting platform",
      "Healthcare Consulting software",
      "Healthcare Consulting system",
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
      "Build a healthcare consulting platform",
      "Create a healthcare consulting app",
      "I need a healthcare consulting management system",
      "Build a healthcare consulting solution",
      "Create a healthcare consulting booking system"
  ],
};
