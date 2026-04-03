/**
 * Youth Leadership App Type Definition
 *
 * Complete definition for youth leadership applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOUTH_LEADERSHIP_APP_TYPE: AppTypeDefinition = {
  id: 'youth-leadership',
  name: 'Youth Leadership',
  category: 'logistics',
  description: 'Youth Leadership platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "youth leadership",
      "youth",
      "leadership",
      "youth software",
      "youth app",
      "youth platform",
      "youth system",
      "youth management",
      "logistics youth"
  ],

  synonyms: [
      "Youth Leadership platform",
      "Youth Leadership software",
      "Youth Leadership system",
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
      "shipment-tracking",
      "route-optimization",
      "fleet-tracking",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "warehouse-mgmt",
      "freight-quotes",
      "carrier-integration",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'logistics',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a youth leadership platform",
      "Create a youth leadership app",
      "I need a youth leadership management system",
      "Build a youth leadership solution",
      "Create a youth leadership booking system"
  ],
};
