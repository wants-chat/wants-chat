/**
 * Quality Consulting App Type Definition
 *
 * Complete definition for quality consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const QUALITY_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'quality-consulting',
  name: 'Quality Consulting',
  category: 'professional-services',
  description: 'Quality Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "quality consulting",
      "quality",
      "consulting",
      "quality software",
      "quality app",
      "quality platform",
      "quality system",
      "quality management",
      "consulting quality"
  ],

  synonyms: [
      "Quality Consulting platform",
      "Quality Consulting software",
      "Quality Consulting system",
      "quality solution",
      "quality service"
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
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a quality consulting platform",
      "Create a quality consulting app",
      "I need a quality consulting management system",
      "Build a quality consulting solution",
      "Create a quality consulting booking system"
  ],
};
