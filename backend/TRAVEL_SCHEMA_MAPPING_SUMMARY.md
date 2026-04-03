# Travel Module Schema Mapping Summary

## Issue Fixed
The travel module was failing because the service was using different field names than the actual database schema.

## Database Schema (Actual)
The `travel_plans` table in `schema.ts` uses:
- `trip_name` (not `title`)
- `trip_type` (not `travel_type`)  
- `notes` (not `description`)
- `budget` as a single numeric field (not JSON object)
- `currency` as a separate field

## DTO to Database Mapping
When creating/updating travel plans, the service now maps:

| DTO Field | Database Field | Notes |
|-----------|----------------|-------|
| `title` | `trip_name` | |
| `travel_type` | `trip_type` | |
| `description` | `notes` | |
| `budget.total_amount` | `budget` | Numeric only |
| `budget.currency` | `currency` | Separate field |
| `budget.categories` | `metadata.budget_categories` | Stored in metadata |
| `companions` | `metadata.companions` | Stored in metadata |
| `preferences` | `metadata.preferences` | Stored in metadata |
| `tags` | `metadata.tags` | Stored in metadata |
| `cover_image_url` | `metadata.cover_image_url` | Stored in metadata |

## Date Format
- Use `YYYY-MM-DD` format for dates (not ISO timestamp)
- Example: `"2024-12-15"` not `"2024-12-15T00:00:00Z"`

## AI Data Storage
The complete AI-generated travel plan (itinerary, hotels, etc.) is stored in the `metadata` field as JSON, preserving all details without schema modifications.

## Example Request (Corrected)
```json
{
  "title": "Paris, France - 5 Day Trip",
  "description": "AI-generated travel plan",
  "destination": "Paris, France",
  "start_date": "2024-12-15",
  "end_date": "2024-12-19",
  "travel_type": "leisure",
  "budget": {
    "total_amount": 3000,
    "currency": "USD"
  },
  "metadata": {
    "ai_generated": true,
    "itinerary": [...],
    "hotels": [...]
  }
}
```