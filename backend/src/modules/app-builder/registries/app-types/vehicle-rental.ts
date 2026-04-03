/**
 * Vehicle Rental App Type Definition
 *
 * Complete definition for vehicle rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VEHICLE_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'vehicle-rental',
  name: 'Vehicle Rental',
  category: 'rental',
  description: 'Vehicle Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "vehicle rental",
      "vehicle",
      "rental",
      "vehicle software",
      "vehicle app",
      "vehicle platform",
      "vehicle system",
      "vehicle management",
      "rental vehicle"
  ],

  synonyms: [
      "Vehicle Rental platform",
      "Vehicle Rental software",
      "Vehicle Rental system",
      "vehicle solution",
      "vehicle service"
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
      "inventory",
      "reservations",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "invoicing",
      "check-in",
      "reviews",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'rental',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a vehicle rental platform",
      "Create a vehicle rental app",
      "I need a vehicle rental management system",
      "Build a vehicle rental solution",
      "Create a vehicle rental booking system"
  ],
};
