/**
 * Logistics Components (React Native)
 *
 * React Native component generators for logistics and supply chain management.
 * Includes shipment tracking, delivery scheduling, warehouse management, and picking.
 */

// Shipment Components
export {
  generateShipmentMap,
  generateShipmentFilters,
  generateShipmentTimeline,
  generateShipmentFiltersWarehouse,
} from './shipment.generator';

// Delivery Components
export {
  generateDeliverySchedule,
  generateDeliveryTracker,
  generateRoutePlanner,
  generateTruckSchedule,
} from './delivery.generator';

// Picking Components
export {
  generatePickList,
  generatePickQueue,
} from './picking.generator';

// Warehouse Components
export {
  generateWarehouseStats,
  generateOrderListWarehouse,
  generateStockLevels,
  generateReceivingForm,
  generateReceivingList,
} from './warehouse.generator';

// Stats Components
export { generateLogisticsStats } from './stats.generator';

// Re-export types
export type { ShipmentOptions } from './shipment.generator';
export type { DeliveryOptions } from './delivery.generator';
export type { PickingOptions } from './picking.generator';
export type { WarehouseOptions } from './warehouse.generator';
export type { LogisticsStatsOptions } from './stats.generator';
