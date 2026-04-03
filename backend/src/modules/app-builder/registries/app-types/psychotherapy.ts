/**
 * Psychotherapy App Type Definition
 *
 * Complete definition for psychotherapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PSYCHOTHERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'psychotherapy',
  name: 'Psychotherapy',
  category: 'healthcare',
  description: 'Psychotherapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "psychotherapy",
      "psychotherapy software",
      "psychotherapy app",
      "psychotherapy platform",
      "psychotherapy system",
      "psychotherapy management",
      "healthcare psychotherapy"
  ],

  synonyms: [
      "Psychotherapy platform",
      "Psychotherapy software",
      "Psychotherapy system",
      "psychotherapy solution",
      "psychotherapy service"
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
      "Build a psychotherapy platform",
      "Create a psychotherapy app",
      "I need a psychotherapy management system",
      "Build a psychotherapy solution",
      "Create a psychotherapy booking system"
  ],
};
