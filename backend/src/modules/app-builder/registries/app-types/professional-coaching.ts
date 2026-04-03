/**
 * Professional Coaching App Type Definition
 *
 * Complete definition for professional coaching applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROFESSIONAL_COACHING_APP_TYPE: AppTypeDefinition = {
  id: 'professional-coaching',
  name: 'Professional Coaching',
  category: 'professional-services',
  description: 'Professional Coaching platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "professional coaching",
      "professional",
      "coaching",
      "professional software",
      "professional app",
      "professional platform",
      "professional system",
      "professional management",
      "professional-services professional"
  ],

  synonyms: [
      "Professional Coaching platform",
      "Professional Coaching software",
      "Professional Coaching system",
      "professional solution",
      "professional service"
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
          "name": "Administrator",
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
          "name": "Staff",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "User",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "clients",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "invoicing",
      "payments",
      "documents",
      "contracts",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'professional-services',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a professional coaching platform",
      "Create a professional coaching app",
      "I need a professional coaching management system",
      "Build a professional coaching solution",
      "Create a professional coaching booking system"
  ],
};
