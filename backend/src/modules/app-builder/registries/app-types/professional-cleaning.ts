/**
 * Professional Cleaning App Type Definition
 *
 * Complete definition for professional cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROFESSIONAL_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'professional-cleaning',
  name: 'Professional Cleaning',
  category: 'professional-services',
  description: 'Professional Cleaning platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "professional cleaning",
      "professional",
      "cleaning",
      "professional software",
      "professional app",
      "professional platform",
      "professional system",
      "professional management",
      "professional-services professional"
  ],

  synonyms: [
      "Professional Cleaning platform",
      "Professional Cleaning software",
      "Professional Cleaning system",
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
      "Build a professional cleaning platform",
      "Create a professional cleaning app",
      "I need a professional cleaning management system",
      "Build a professional cleaning solution",
      "Create a professional cleaning booking system"
  ],
};
