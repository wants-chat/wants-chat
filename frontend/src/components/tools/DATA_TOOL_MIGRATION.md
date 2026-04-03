# Data Tool Migration Guide

This guide shows how to migrate data-driven tools to use the new `useToolData` hook for:
- Backend database persistence
- Export capabilities (CSV, Excel, JSON, PDF)
- Import capabilities
- Sync status indicators

## Quick Migration Steps

### 1. Add Imports

```tsx
// Add these imports
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import type { ColumnConfig } from '../../lib/toolDataUtils';
```

### 2. Define Column Config

```tsx
// Define columns for export (usually at component top level)
const COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'isActive', header: 'Active', type: 'boolean' },
];
```

### 3. Replace State Management

**BEFORE:**
```tsx
const [items, setItems] = useState<Item[]>([]);

useEffect(() => {
  const saved = localStorage.getItem('my-tool-data');
  if (saved) setItems(JSON.parse(saved));
}, []);

useEffect(() => {
  localStorage.setItem('my-tool-data', JSON.stringify(items));
}, [items]);
```

**AFTER:**
```tsx
const {
  data: items,
  setData: setItems,
  addItem,
  updateItem,
  deleteItem,
  exportCSV,
  exportExcel,
  exportJSON,
  exportPDF,
  importCSV,
  importJSON,
  copyToClipboard,
  print,
  clearData,
  isLoading,
  isSaving,
  isSynced,
  lastSaved,
  syncError,
  forceSync,
} = useToolData<Item>('my-tool-id', [], COLUMNS);
```

### 4. Add Export UI

```tsx
<div className="flex items-center gap-2">
  <SyncStatus
    isSynced={isSynced}
    isSaving={isSaving}
    lastSaved={lastSaved}
    syncError={syncError}
    onForceSync={forceSync}
    theme={isDark ? 'dark' : 'light'}
  />
  <ExportDropdown
    onExportCSV={exportCSV}
    onExportExcel={exportExcel}
    onExportJSON={exportJSON}
    onExportPDF={exportPDF}
    onPrint={print}
    onCopyToClipboard={copyToClipboard}
    onImportCSV={importCSV}
    onImportJSON={importJSON}
    theme={isDark ? 'dark' : 'light'}
  />
</div>
```

### 5. Handle Loading State

```tsx
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );
}
```

## Complete Example

See `RoomBookingTool.tsx` for a complete implementation example.

## Tools Already Migrated

- [x] RoomBookingTool

## Tools Pending Migration (126 total)

- [ ] ApplianceRepairTool
- [ ] AppointmentSchedulerTool
- [ ] AttendanceTrackerTool
- [ ] BookkeepingTool
- [ ] BudgetDashboardTool
- [ ] ... (see full list in migration script)

## API Endpoints

The backend provides these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tool-data` | Get all tool data for user |
| GET | `/api/v1/tool-data/:toolId` | Get data for specific tool |
| POST | `/api/v1/tool-data/:toolId` | Save/update tool data |
| DELETE | `/api/v1/tool-data/:toolId` | Delete tool data |
| GET | `/api/v1/tool-data/:toolId/export` | Export as JSON |
| GET | `/api/v1/tool-data/export/all` | Export all tools |
