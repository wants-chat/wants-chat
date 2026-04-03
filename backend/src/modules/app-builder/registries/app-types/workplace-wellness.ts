/**
 * Workplace Wellness App Type Definition
 *
 * Complete definition for workplace wellness applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORKPLACE_WELLNESS_APP_TYPE: AppTypeDefinition = {
  id: 'workplace-wellness',
  name: 'Workplace Wellness',
  category: 'wellness',
  description: 'Workplace Wellness platform with comprehensive management features',
  icon: 'leaf',

  keywords: [
      "workplace wellness",
      "workplace",
      "wellness",
      "workplace software",
      "workplace app",
      "workplace platform",
      "workplace system",
      "workplace management",
      "wellness workplace"
  ],

  synonyms: [
      "Workplace Wellness platform",
      "Workplace Wellness software",
      "Workplace Wellness system",
      "workplace solution",
      "workplace service"
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
      "search",
      "gallery"
  ],

  optionalFeatures: [
      "membership-plans",
      "payments",
      "reviews",
      "blog",
      "messaging"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'wellness',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'natural',

  examplePrompts: [
      "Build a workplace wellness platform",
      "Create a workplace wellness app",
      "I need a workplace wellness management system",
      "Build a workplace wellness solution",
      "Create a workplace wellness booking system"
  ],
};
