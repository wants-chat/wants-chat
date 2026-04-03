/**
 * Senior Daycare App Type Definition
 *
 * Complete definition for senior daycare applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_DAYCARE_APP_TYPE: AppTypeDefinition = {
  id: 'senior-daycare',
  name: 'Senior Daycare',
  category: 'healthcare',
  description: 'Senior Daycare platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "senior daycare",
      "senior",
      "daycare",
      "senior software",
      "senior app",
      "senior platform",
      "senior system",
      "senior management",
      "healthcare senior"
  ],

  synonyms: [
      "Senior Daycare platform",
      "Senior Daycare software",
      "Senior Daycare system",
      "senior solution",
      "senior service"
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
      "Build a senior daycare platform",
      "Create a senior daycare app",
      "I need a senior daycare management system",
      "Build a senior daycare solution",
      "Create a senior daycare booking system"
  ],
};
