/**
 * Tenant Screening App Type Definition
 *
 * Complete definition for tenant screening applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TENANT_SCREENING_APP_TYPE: AppTypeDefinition = {
  id: 'tenant-screening',
  name: 'Tenant Screening',
  category: 'real-estate',
  description: 'Tenant Screening platform with comprehensive management features',
  icon: 'home',

  keywords: [
      "tenant screening",
      "tenant",
      "screening",
      "tenant software",
      "tenant app",
      "tenant platform",
      "tenant system",
      "tenant management",
      "real-estate tenant"
  ],

  synonyms: [
      "Tenant Screening platform",
      "Tenant Screening software",
      "Tenant Screening system",
      "tenant solution",
      "tenant service"
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
      "Build a tenant screening platform",
      "Create a tenant screening app",
      "I need a tenant screening management system",
      "Build a tenant screening solution",
      "Create a tenant screening booking system"
  ],
};
