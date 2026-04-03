/**
 * Package Design App Type Definition
 *
 * Complete definition for package design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PACKAGE_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'package-design',
  name: 'Package Design',
  category: 'services',
  description: 'Package Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "package design",
      "package",
      "design",
      "package software",
      "package app",
      "package platform",
      "package system",
      "package management",
      "services package"
  ],

  synonyms: [
      "Package Design platform",
      "Package Design software",
      "Package Design system",
      "package solution",
      "package service"
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
      "Build a package design platform",
      "Create a package design app",
      "I need a package design management system",
      "Build a package design solution",
      "Create a package design booking system"
  ],
};
