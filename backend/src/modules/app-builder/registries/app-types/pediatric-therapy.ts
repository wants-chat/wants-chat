/**
 * Pediatric Therapy App Type Definition
 *
 * Complete definition for pediatric therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PEDIATRIC_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'pediatric-therapy',
  name: 'Pediatric Therapy',
  category: 'healthcare',
  description: 'Pediatric Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "pediatric therapy",
      "pediatric",
      "therapy",
      "pediatric software",
      "pediatric app",
      "pediatric platform",
      "pediatric system",
      "pediatric management",
      "healthcare pediatric"
  ],

  synonyms: [
      "Pediatric Therapy platform",
      "Pediatric Therapy software",
      "Pediatric Therapy system",
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
      "calendar",
      "scheduling",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "treatment-plans",
      "documents",
      "invoicing",
      "payments",
      "messaging"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'healthcare',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'calm',

  examplePrompts: [
      "Build a pediatric therapy platform",
      "Create a pediatric therapy app",
      "I need a pediatric therapy management system",
      "Build a pediatric therapy solution",
      "Create a pediatric therapy booking system"
  ],
};
