/**
 * Wellness Consulting App Type Definition
 *
 * Complete definition for wellness consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WELLNESS_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'wellness-consulting',
  name: 'Wellness Consulting',
  category: 'wellness',
  description: 'Wellness Consulting platform with comprehensive management features',
  icon: 'leaf',

  keywords: [
      "wellness consulting",
      "wellness",
      "consulting",
      "wellness software",
      "wellness app",
      "wellness platform",
      "wellness system",
      "wellness management",
      "wellness wellness"
  ],

  synonyms: [
      "Wellness Consulting platform",
      "Wellness Consulting software",
      "Wellness Consulting system",
      "wellness solution",
      "wellness service"
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
      "Build a wellness consulting platform",
      "Create a wellness consulting app",
      "I need a wellness consulting management system",
      "Build a wellness consulting solution",
      "Create a wellness consulting booking system"
  ],
};
