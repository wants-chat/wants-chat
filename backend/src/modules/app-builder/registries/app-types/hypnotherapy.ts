/**
 * Hypnotherapy App Type Definition
 *
 * Complete definition for hypnotherapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HYPNOTHERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'hypnotherapy',
  name: 'Hypnotherapy',
  category: 'healthcare',
  description: 'Hypnotherapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "hypnotherapy",
      "hypnotherapy software",
      "hypnotherapy app",
      "hypnotherapy platform",
      "hypnotherapy system",
      "hypnotherapy management",
      "healthcare hypnotherapy"
  ],

  synonyms: [
      "Hypnotherapy platform",
      "Hypnotherapy software",
      "Hypnotherapy system",
      "hypnotherapy solution",
      "hypnotherapy service"
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
      "Build a hypnotherapy platform",
      "Create a hypnotherapy app",
      "I need a hypnotherapy management system",
      "Build a hypnotherapy solution",
      "Create a hypnotherapy booking system"
  ],
};
