/**
 * Youth Enrichment App Type Definition
 *
 * Complete definition for youth enrichment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOUTH_ENRICHMENT_APP_TYPE: AppTypeDefinition = {
  id: 'youth-enrichment',
  name: 'Youth Enrichment',
  category: 'services',
  description: 'Youth Enrichment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "youth enrichment",
      "youth",
      "enrichment",
      "youth software",
      "youth app",
      "youth platform",
      "youth system",
      "youth management",
      "services youth"
  ],

  synonyms: [
      "Youth Enrichment platform",
      "Youth Enrichment software",
      "Youth Enrichment system",
      "youth solution",
      "youth service"
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a youth enrichment platform",
      "Create a youth enrichment app",
      "I need a youth enrichment management system",
      "Build a youth enrichment solution",
      "Create a youth enrichment booking system"
  ],
};
