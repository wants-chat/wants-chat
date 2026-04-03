/**
 * Aspiration Therapy App Type Definition
 *
 * Complete definition for aspiration therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASPIRATION_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'aspiration-therapy',
  name: 'Aspiration Therapy',
  category: 'healthcare',
  description: 'Aspiration Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "aspiration therapy",
      "aspiration",
      "therapy",
      "aspiration software",
      "aspiration app",
      "aspiration platform",
      "aspiration system",
      "aspiration management",
      "healthcare aspiration"
  ],

  synonyms: [
      "Aspiration Therapy platform",
      "Aspiration Therapy software",
      "Aspiration Therapy system",
      "aspiration solution",
      "aspiration service"
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
      "Build a aspiration therapy platform",
      "Create a aspiration therapy app",
      "I need a aspiration therapy management system",
      "Build a aspiration therapy solution",
      "Create a aspiration therapy booking system"
  ],
};
