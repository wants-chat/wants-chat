/**
 * Pediatric Dentistry App Type Definition
 *
 * Complete definition for pediatric dentistry applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PEDIATRIC_DENTISTRY_APP_TYPE: AppTypeDefinition = {
  id: 'pediatric-dentistry',
  name: 'Pediatric Dentistry',
  category: 'healthcare',
  description: 'Pediatric Dentistry platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "pediatric dentistry",
      "pediatric",
      "dentistry",
      "pediatric software",
      "pediatric app",
      "pediatric platform",
      "pediatric system",
      "pediatric management",
      "healthcare pediatric"
  ],

  synonyms: [
      "Pediatric Dentistry platform",
      "Pediatric Dentistry software",
      "Pediatric Dentistry system",
      "pediatric solution",
      "pediatric service"
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
      "Build a pediatric dentistry platform",
      "Create a pediatric dentistry app",
      "I need a pediatric dentistry management system",
      "Build a pediatric dentistry solution",
      "Create a pediatric dentistry booking system"
  ],
};
