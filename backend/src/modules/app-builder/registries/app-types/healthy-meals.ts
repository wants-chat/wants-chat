/**
 * Healthy Meals App Type Definition
 *
 * Complete definition for healthy meals applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HEALTHY_MEALS_APP_TYPE: AppTypeDefinition = {
  id: 'healthy-meals',
  name: 'Healthy Meals',
  category: 'healthcare',
  description: 'Healthy Meals platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "healthy meals",
      "healthy",
      "meals",
      "healthy software",
      "healthy app",
      "healthy platform",
      "healthy system",
      "healthy management",
      "healthcare healthy"
  ],

  synonyms: [
      "Healthy Meals platform",
      "Healthy Meals software",
      "Healthy Meals system",
      "healthy solution",
      "healthy service"
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
      "Build a healthy meals platform",
      "Create a healthy meals app",
      "I need a healthy meals management system",
      "Build a healthy meals solution",
      "Create a healthy meals booking system"
  ],
};
