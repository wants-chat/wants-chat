/**
 * Real Estate Appraisal App Type Definition
 *
 * Complete definition for real estate appraisal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REAL_ESTATE_APPRAISAL_APP_TYPE: AppTypeDefinition = {
  id: 'real-estate-appraisal',
  name: 'Real Estate Appraisal',
  category: 'real-estate',
  description: 'Real Estate Appraisal platform with comprehensive management features',
  icon: 'home',

  keywords: [
      "real estate appraisal",
      "real",
      "estate",
      "appraisal",
      "real software",
      "real app",
      "real platform",
      "real system",
      "real management",
      "real-estate real"
  ],

  synonyms: [
      "Real Estate Appraisal platform",
      "Real Estate Appraisal software",
      "Real Estate Appraisal system",
      "real solution",
      "real service"
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
          "name": "Broker",
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
          "name": "Agent",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Client",
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
      "property-listings",
      "showing-management",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "virtual-tours",
      "mls-integration",
      "property-valuation",
      "clients",
      "crm"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'real-estate',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a real estate appraisal platform",
      "Create a real estate appraisal app",
      "I need a real estate appraisal management system",
      "Build a real estate appraisal solution",
      "Create a real estate appraisal booking system"
  ],
};
