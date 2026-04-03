/**
 * Remaining Component Generators
 * For various industry-specific components
 */

export interface RemainingComponentsOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Customer Boats Component
 */
export function generateCustomerBoats(options: RemainingComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface CustomerBoatsProps {
      boats: Array<{
        id: string;
        name: string;
        type: string;
        length: string;
        make: string;
        model: string;
        year: number;
        slip?: string;
        registrationNumber: string;
        lastService?: string;
      }>;
      onSelect?: (id: string) => void;
      onAddBoat?: () => void;
    }

    const CustomerBoats: React.FC<CustomerBoatsProps> = ({ boats, onSelect, onAddBoat }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Registered Boats</h3>
            {onAddBoat && (
              <button onClick={onAddBoat} className="px-3 py-1 text-sm text-white rounded hover:opacity-90" style={{ backgroundColor: '${primaryColor}' }}>
                + Add Boat
              </button>
            )}
          </div>
          <div className="divide-y">
            {boats.map((boat) => (
              <div key={boat.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => onSelect?.(boat.id)}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⛵</span>
                  <div className="flex-1">
                    <p className="font-medium">{boat.name}</p>
                    <p className="text-sm text-gray-500">{boat.year} {boat.make} {boat.model} • {boat.length}</p>
                    <p className="text-xs text-gray-400">Reg: {boat.registrationNumber} {boat.slip ? \`• Slip: \${boat.slip}\` : ''}</p>
                  </div>
                  {boat.lastService && <p className="text-xs text-gray-400">Last service: {boat.lastService}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Customer Equipment HVAC Component
 */
export function generateCustomerEquipmentHvac(options: RemainingComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface CustomerEquipmentHvacProps {
      equipment: Array<{
        id: string;
        type: 'furnace' | 'ac' | 'heat-pump' | 'boiler' | 'water-heater';
        brand: string;
        model: string;
        serialNumber: string;
        installDate: string;
        warrantyExpires?: string;
        lastService?: string;
        location: string;
      }>;
      onSelect?: (id: string) => void;
      onScheduleService?: (id: string) => void;
    }

    const CustomerEquipmentHvac: React.FC<CustomerEquipmentHvacProps> = ({ equipment, onSelect, onScheduleService }) => {
      const typeIcons = { furnace: '🔥', ac: '❄️', 'heat-pump': '🌡️', boiler: '💨', 'water-heater': '🚿' };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b"><h3 className="font-semibold">HVAC Equipment</h3></div>
          <div className="divide-y">
            {equipment.map((eq) => (
              <div key={eq.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="cursor-pointer" onClick={() => onSelect?.(eq.id)}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{typeIcons[eq.type]}</span>
                      <span className="font-medium capitalize">{eq.type.replace('-', ' ')}</span>
                    </div>
                    <p className="text-sm text-gray-600">{eq.brand} {eq.model}</p>
                    <p className="text-xs text-gray-500">S/N: {eq.serialNumber} • Location: {eq.location}</p>
                    <p className="text-xs text-gray-400">Installed: {eq.installDate}</p>
                  </div>
                  {onScheduleService && (
                    <button onClick={() => onScheduleService(eq.id)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                      Schedule Service
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Customer Prescriptions Component
 */
export function generateCustomerPrescriptions(options: RemainingComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface CustomerPrescriptionsProps {
      prescriptions: Array<{
        id: string;
        medication: string;
        dosage: string;
        frequency: string;
        prescribedBy: string;
        prescribedDate: string;
        refillsRemaining: number;
        lastFilled?: string;
        status: 'active' | 'expired' | 'discontinued';
      }>;
      onRefill?: (id: string) => void;
      onSelect?: (id: string) => void;
    }

    const CustomerPrescriptions: React.FC<CustomerPrescriptionsProps> = ({ prescriptions, onRefill, onSelect }) => {
      const statusColors = { active: 'bg-green-100 text-green-800', expired: 'bg-red-100 text-red-800', discontinued: 'bg-gray-100 text-gray-600' };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b"><h3 className="font-semibold">Prescriptions</h3></div>
          <div className="divide-y">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="cursor-pointer" onClick={() => onSelect?.(rx.id)}>
                    <p className="font-medium">{rx.medication}</p>
                    <p className="text-sm text-gray-600">{rx.dosage} • {rx.frequency}</p>
                    <p className="text-xs text-gray-500">Dr. {rx.prescribedBy} • {rx.prescribedDate}</p>
                    <p className="text-xs text-gray-400">{rx.refillsRemaining} refills remaining</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[rx.status]}\`}>{rx.status}</span>
                    {rx.status === 'active' && rx.refillsRemaining > 0 && onRefill && (
                      <button onClick={() => onRefill(rx.id)} className="px-3 py-1 text-sm text-white rounded hover:opacity-90" style={{ backgroundColor: '${primaryColor}' }}>
                        Refill
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Customer Prescriptions Optician Component
 */
export function generateCustomerPrescriptionsOptician(options: RemainingComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface CustomerPrescriptionsOpticianProps {
      prescriptions: Array<{
        id: string;
        type: 'glasses' | 'contacts';
        prescribedDate: string;
        expiresDate: string;
        doctor: string;
        rightEye: { sphere: string; cylinder: string; axis: string; add?: string };
        leftEye: { sphere: string; cylinder: string; axis: string; add?: string };
        pd?: string;
      }>;
      onSelect?: (id: string) => void;
      onOrderNew?: (id: string) => void;
    }

    const CustomerPrescriptionsOptician: React.FC<CustomerPrescriptionsOpticianProps> = ({ prescriptions, onSelect, onOrderNew }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b"><h3 className="font-semibold">Vision Prescriptions</h3></div>
          <div className="divide-y">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="cursor-pointer" onClick={() => onSelect?.(rx.id)}>
                    <div className="flex items-center gap-2">
                      <span>{rx.type === 'glasses' ? '👓' : '👁️'}</span>
                      <span className="font-medium capitalize">{rx.type}</span>
                    </div>
                    <p className="text-sm text-gray-500">Dr. {rx.doctor} • {rx.prescribedDate}</p>
                  </div>
                  {onOrderNew && (
                    <button onClick={() => onOrderNew(rx.id)} className="px-3 py-1 text-sm text-white rounded hover:opacity-90" style={{ backgroundColor: '${primaryColor}' }}>
                      Order New
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium text-xs text-gray-500">Right Eye (OD)</p>
                    <p>SPH: {rx.rightEye.sphere} CYL: {rx.rightEye.cylinder} AXIS: {rx.rightEye.axis}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium text-xs text-gray-500">Left Eye (OS)</p>
                    <p>SPH: {rx.leftEye.sphere} CYL: {rx.leftEye.cylinder} AXIS: {rx.leftEye.axis}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Ingredient List Component
 */
export function generateIngredientList(options: RemainingComponentsOptions = {}): string {
  return `
    interface IngredientListProps {
      ingredients: Array<{ name: string; amount: string; unit: string; notes?: string }>;
      servings?: number;
      onAdjustServings?: (servings: number) => void;
    }

    const IngredientList: React.FC<IngredientListProps> = ({ ingredients, servings = 4, onAdjustServings }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Ingredients</h3>
            {onAdjustServings && (
              <div className="flex items-center gap-2">
                <button onClick={() => onAdjustServings(Math.max(1, servings - 1))} className="w-8 h-8 border rounded">-</button>
                <span className="text-sm">{servings} servings</span>
                <button onClick={() => onAdjustServings(servings + 1)} className="w-8 h-8 border rounded">+</button>
              </div>
            )}
          </div>
          <ul className="space-y-2">
            {ingredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 mt-1 rounded-full border flex-shrink-0" />
                <span><strong>{ing.amount} {ing.unit}</strong> {ing.name} {ing.notes && <span className="text-gray-500 text-sm">({ing.notes})</span>}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    };
  `;
}

/**
 * Generate Library Activity Component
 */
export function generateLibraryActivity(options: RemainingComponentsOptions = {}): string {
  return `
    interface LibraryActivityProps {
      activities: Array<{
        id: string;
        type: 'checkout' | 'return' | 'hold' | 'renew' | 'fine';
        item: string;
        date: string;
        dueDate?: string;
        amount?: number;
      }>;
    }

    const LibraryActivity: React.FC<LibraryActivityProps> = ({ activities }) => {
      const typeIcons = { checkout: '📖', return: '✅', hold: '🔖', renew: '🔄', fine: '💰' };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b"><h3 className="font-semibold">Recent Activity</h3></div>
          <div className="divide-y">
            {activities.map((act) => (
              <div key={act.id} className="p-3 flex items-center gap-3">
                <span className="text-xl">{typeIcons[act.type]}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">{act.type}: {act.item}</p>
                  <p className="text-xs text-gray-500">{act.date} {act.dueDate ? \`• Due: \${act.dueDate}\` : ''}</p>
                </div>
                {act.amount && <span className="text-sm font-medium text-red-500">\${act.amount}</span>}
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Library Tabs Component
 */
export function generateLibraryTabs(options: RemainingComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface LibraryTabsProps {
      tabs: Array<{ id: string; label: string; count?: number }>;
      activeTab: string;
      onTabChange?: (id: string) => void;
    }

    const LibraryTabs: React.FC<LibraryTabsProps> = ({ tabs, activeTab, onTabChange }) => {
      return (
        <div className="border-b">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={\`px-4 py-3 text-sm font-medium border-b-2 transition-colors \${activeTab === tab.id ? 'border-current' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
                style={{ color: activeTab === tab.id ? '${primaryColor}' : undefined }}
              >
                {tab.label} {tab.count !== undefined && <span className="ml-1 text-gray-400">({tab.count})</span>}
              </button>
            ))}
          </nav>
        </div>
      );
    };
  `;
}

/**
 * Generate Live Auction Component
 */
export function generateLiveAuction(options: RemainingComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface LiveAuctionProps {
      auction: {
        id: string;
        title: string;
        image?: string;
        currentBid: number;
        bidCount: number;
        timeRemaining: string;
        highBidder: string;
        minIncrement: number;
      };
      onBid?: (amount: number) => void;
    }

    const LiveAuction: React.FC<LiveAuctionProps> = ({ auction, onBid }) => {
      const [bidAmount, setBidAmount] = React.useState(auction.currentBid + auction.minIncrement);

      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {auction.image && <img src={auction.image} alt={auction.title} className="w-full h-48 object-cover" />}
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">{auction.title}</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold" style={{ color: '${primaryColor}' }}>\${auction.currentBid.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{auction.bidCount} bids • High: {auction.highBidder}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-red-500">⏱ {auction.timeRemaining}</p>
                <p className="text-xs text-gray-400">remaining</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min={auction.currentBid + auction.minIncrement}
                step={auction.minIncrement}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={() => onBid?.(bidAmount)}
                className="px-6 py-2 text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: '${primaryColor}' }}
              >
                Place Bid
              </button>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Loan Filters Component
 */
export function generateLoanFilters(options: RemainingComponentsOptions = {}): string {
  return `
    interface LoanFiltersProps {
      filters: { status?: string; type?: string; dateRange?: string };
      onChange?: (filters: any) => void;
    }

    const LoanFilters: React.FC<LoanFiltersProps> = ({ filters, onChange }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-wrap gap-4">
            <select value={filters.status || ''} onChange={(e) => onChange?.({ ...filters, status: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
              <option value="defaulted">Defaulted</option>
            </select>
            <select value={filters.type || ''} onChange={(e) => onChange?.({ ...filters, type: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">All Types</option>
              <option value="personal">Personal</option>
              <option value="mortgage">Mortgage</option>
              <option value="auto">Auto</option>
              <option value="business">Business</option>
            </select>
            <select value={filters.dateRange || ''} onChange={(e) => onChange?.({ ...filters, dateRange: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">All Time</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Meal Planner Component
 */
export function generateMealPlanner(options: RemainingComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface MealPlannerProps {
      meals: Array<{
        day: string;
        breakfast?: { name: string; calories: number };
        lunch?: { name: string; calories: number };
        dinner?: { name: string; calories: number };
        snacks?: Array<{ name: string; calories: number }>;
      }>;
      onEditMeal?: (day: string, mealType: string) => void;
    }

    const MealPlanner: React.FC<MealPlannerProps> = ({ meals, onEditMeal }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">Day</th>
                <th className="p-3 text-left">Breakfast</th>
                <th className="p-3 text-left">Lunch</th>
                <th className="p-3 text-left">Dinner</th>
                <th className="p-3 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {meals.map((day) => {
                const total = (day.breakfast?.calories || 0) + (day.lunch?.calories || 0) + (day.dinner?.calories || 0);
                return (
                  <tr key={day.day} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{day.day}</td>
                    <td className="p-3 cursor-pointer" onClick={() => onEditMeal?.(day.day, 'breakfast')}>
                      {day.breakfast ? <><p className="font-medium">{day.breakfast.name}</p><p className="text-xs text-gray-500">{day.breakfast.calories} cal</p></> : <span className="text-gray-400">+ Add</span>}
                    </td>
                    <td className="p-3 cursor-pointer" onClick={() => onEditMeal?.(day.day, 'lunch')}>
                      {day.lunch ? <><p className="font-medium">{day.lunch.name}</p><p className="text-xs text-gray-500">{day.lunch.calories} cal</p></> : <span className="text-gray-400">+ Add</span>}
                    </td>
                    <td className="p-3 cursor-pointer" onClick={() => onEditMeal?.(day.day, 'dinner')}>
                      {day.dinner ? <><p className="font-medium">{day.dinner.name}</p><p className="text-xs text-gray-500">{day.dinner.calories} cal</p></> : <span className="text-gray-400">+ Add</span>}
                    </td>
                    <td className="p-3 font-medium" style={{ color: '${primaryColor}' }}>{total} cal</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    };
  `;
}

/**
 * Generate Medical Records Vet Component
 */
export function generateMedicalRecordsVet(options: RemainingComponentsOptions = {}): string {
  return `
    interface MedicalRecordsVetProps {
      records: Array<{
        id: string;
        date: string;
        type: 'exam' | 'vaccination' | 'surgery' | 'lab' | 'treatment';
        description: string;
        vet: string;
        notes?: string;
        attachments?: string[];
      }>;
      onSelect?: (id: string) => void;
    }

    const MedicalRecordsVet: React.FC<MedicalRecordsVetProps> = ({ records, onSelect }) => {
      const typeIcons = { exam: '🩺', vaccination: '💉', surgery: '🏥', lab: '🔬', treatment: '💊' };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b"><h3 className="font-semibold">Medical Records</h3></div>
          <div className="divide-y">
            {records.map((rec) => (
              <div key={rec.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => onSelect?.(rec.id)}>
                <div className="flex items-start gap-3">
                  <span className="text-xl">{typeIcons[rec.type]}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium capitalize">{rec.type}</p>
                      <p className="text-sm text-gray-500">{rec.date}</p>
                    </div>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                    <p className="text-xs text-gray-400">Dr. {rec.vet}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Medication Schedule Today Component
 */
export function generateMedicationScheduleToday(options: RemainingComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface MedicationScheduleTodayProps {
      medications: Array<{
        id: string;
        name: string;
        dosage: string;
        time: string;
        taken: boolean;
        notes?: string;
      }>;
      onMarkTaken?: (id: string) => void;
    }

    const MedicationScheduleToday: React.FC<MedicationScheduleTodayProps> = ({ medications, onMarkTaken }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b"><h3 className="font-semibold">Today's Medications</h3></div>
          <div className="divide-y">
            {medications.map((med) => (
              <div key={med.id} className={\`p-4 flex items-center justify-between \${med.taken ? 'bg-green-50' : ''}\`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{med.taken ? '✅' : '💊'}</span>
                  <div>
                    <p className={\`font-medium \${med.taken ? 'line-through text-gray-400' : ''}\`}>{med.name}</p>
                    <p className="text-sm text-gray-500">{med.dosage} • {med.time}</p>
                  </div>
                </div>
                {!med.taken && onMarkTaken && (
                  <button onClick={() => onMarkTaken(med.id)} className="px-3 py-1 text-sm text-white rounded hover:opacity-90" style={{ backgroundColor: '${primaryColor}' }}>
                    Mark Taken
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Movement History Component
 */
export function generateMovementHistory(options: RemainingComponentsOptions = {}): string {
  return `
    interface MovementHistoryProps {
      movements: Array<{
        id: string;
        date: string;
        type: 'in' | 'out' | 'transfer';
        item: string;
        quantity: number;
        from?: string;
        to?: string;
        reference?: string;
        user: string;
      }>;
    }

    const MovementHistory: React.FC<MovementHistoryProps> = ({ movements }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b"><h3 className="font-semibold">Movement History</h3></div>
          <div className="divide-y">
            {movements.map((mov) => (
              <div key={mov.id} className="p-4">
                <div className="flex items-center gap-3">
                  <span className={\`text-lg \${mov.type === 'in' ? 'text-green-500' : mov.type === 'out' ? 'text-red-500' : 'text-blue-500'}\`}>
                    {mov.type === 'in' ? '↓' : mov.type === 'out' ? '↑' : '↔'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{mov.item}</p>
                    <p className="text-sm text-gray-500">
                      {mov.type === 'transfer' ? \`\${mov.from} → \${mov.to}\` : mov.type === 'in' ? \`From: \${mov.from}\` : \`To: \${mov.to}\`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={\`font-medium \${mov.type === 'in' ? 'text-green-600' : mov.type === 'out' ? 'text-red-600' : ''}\`}>
                      {mov.type === 'in' ? '+' : mov.type === 'out' ? '-' : ''}{mov.quantity}
                    </p>
                    <p className="text-xs text-gray-400">{mov.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Nutrition Info Component
 */
export function generateNutritionInfo(options: RemainingComponentsOptions = {}): string {
  return `
    interface NutritionInfoProps {
      nutrition: {
        servingSize: string;
        calories: number;
        fat: number;
        saturatedFat?: number;
        carbs: number;
        fiber?: number;
        sugar?: number;
        protein: number;
        sodium?: number;
      };
    }

    const NutritionInfo: React.FC<NutritionInfoProps> = ({ nutrition }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-bold text-lg border-b pb-2 mb-2">Nutrition Facts</h3>
          <p className="text-sm mb-2">Serving Size: {nutrition.servingSize}</p>
          <div className="border-t-8 border-black pt-2">
            <div className="flex justify-between font-bold text-lg"><span>Calories</span><span>{nutrition.calories}</span></div>
          </div>
          <div className="border-t border-black mt-2 pt-2 space-y-1 text-sm">
            <div className="flex justify-between"><span>Total Fat</span><span>{nutrition.fat}g</span></div>
            {nutrition.saturatedFat !== undefined && <div className="flex justify-between pl-4"><span>Saturated Fat</span><span>{nutrition.saturatedFat}g</span></div>}
            <div className="flex justify-between border-t pt-1"><span>Total Carbohydrate</span><span>{nutrition.carbs}g</span></div>
            {nutrition.fiber !== undefined && <div className="flex justify-between pl-4"><span>Dietary Fiber</span><span>{nutrition.fiber}g</span></div>}
            {nutrition.sugar !== undefined && <div className="flex justify-between pl-4"><span>Sugars</span><span>{nutrition.sugar}g</span></div>}
            <div className="flex justify-between border-t pt-1"><span>Protein</span><span>{nutrition.protein}g</span></div>
            {nutrition.sodium !== undefined && <div className="flex justify-between border-t pt-1"><span>Sodium</span><span>{nutrition.sodium}mg</span></div>}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Product Detail Card Component
 */
export function generateProductDetailCard(options: RemainingComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ProductDetailCardProps {
      product: {
        id: string;
        name: string;
        description: string;
        price: number;
        salePrice?: number;
        image?: string;
        sku: string;
        inStock: boolean;
        rating?: number;
        reviewCount?: number;
      };
      onAddToCart?: () => void;
    }

    const ProductDetailCard: React.FC<ProductDetailCardProps> = ({ product, onAddToCart }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          {product.image && <img src={product.image} alt={product.name} className="w-full h-48 object-contain mb-4" />}
          <h3 className="font-bold text-lg">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
          <p className="text-gray-600 text-sm mb-4">{product.description}</p>
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-yellow-400">{'★'.repeat(Math.round(product.rating))}</span>
              <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              {product.salePrice ? (
                <><span className="text-xl font-bold text-red-500">\${product.salePrice}</span><span className="text-gray-400 line-through ml-2">\${product.price}</span></>
              ) : (
                <span className="text-xl font-bold">\${product.price}</span>
              )}
            </div>
            {product.inStock ? (
              <button onClick={onAddToCart} className="px-4 py-2 text-white rounded-lg hover:opacity-90" style={{ backgroundColor: '${primaryColor}' }}>Add to Cart</button>
            ) : (
              <span className="text-gray-400">Out of Stock</span>
            )}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Product Filters Component
 */
export function generateProductFilters(options: RemainingComponentsOptions = {}): string {
  return `
    interface ProductFiltersProps {
      filters: { category?: string; priceRange?: string; inStock?: boolean; search?: string };
      categories?: string[];
      onChange?: (filters: any) => void;
    }

    const ProductFilters: React.FC<ProductFiltersProps> = ({ filters, categories = [], onChange }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
          <input type="text" placeholder="Search products..." value={filters.search || ''} onChange={(e) => onChange?.({ ...filters, search: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          <select value={filters.category || ''} onChange={(e) => onChange?.({ ...filters, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.priceRange || ''} onChange={(e) => onChange?.({ ...filters, priceRange: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option value="">Any Price</option>
            <option value="0-25">Under $25</option>
            <option value="25-50">$25 - $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100+">$100+</option>
          </select>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={filters.inStock || false} onChange={(e) => onChange?.({ ...filters, inStock: e.target.checked })} />
            <span className="text-sm">In Stock Only</span>
          </label>
        </div>
      );
    };
  `;
}

/**
 * Generate Product Filters Design Component
 */
export function generateProductFiltersDesign(options: RemainingComponentsOptions = {}): string {
  return `
    interface ProductFiltersDesignProps {
      filters: { category?: string; style?: string; color?: string; priceRange?: string };
      onChange?: (filters: any) => void;
    }

    const ProductFiltersDesign: React.FC<ProductFiltersDesignProps> = ({ filters, onChange }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
          <select value={filters.category || ''} onChange={(e) => onChange?.({ ...filters, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option value="">All Categories</option>
            <option value="logos">Logos</option>
            <option value="websites">Websites</option>
            <option value="apps">Apps</option>
            <option value="print">Print</option>
          </select>
          <select value={filters.style || ''} onChange={(e) => onChange?.({ ...filters, style: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option value="">Any Style</option>
            <option value="minimal">Minimal</option>
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="playful">Playful</option>
          </select>
        </div>
      );
    };
  `;
}

/**
 * Generate Project Content Component
 */
export function generateProjectContent(options: RemainingComponentsOptions = {}): string {
  return `
    interface ProjectContentProps {
      content: { overview: string; challenge?: string; solution?: string; results?: string };
    }

    const ProjectContent: React.FC<ProjectContentProps> = ({ content }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <section>
            <h3 className="font-semibold text-lg mb-2">Overview</h3>
            <p className="text-gray-600">{content.overview}</p>
          </section>
          {content.challenge && (
            <section>
              <h3 className="font-semibold text-lg mb-2">The Challenge</h3>
              <p className="text-gray-600">{content.challenge}</p>
            </section>
          )}
          {content.solution && (
            <section>
              <h3 className="font-semibold text-lg mb-2">Our Solution</h3>
              <p className="text-gray-600">{content.solution}</p>
            </section>
          )}
          {content.results && (
            <section>
              <h3 className="font-semibold text-lg mb-2">Results</h3>
              <p className="text-gray-600">{content.results}</p>
            </section>
          )}
        </div>
      );
    };
  `;
}

/**
 * Generate Project Filters Component
 */
export function generateProjectFilters(options: RemainingComponentsOptions = {}): string {
  return `
    interface ProjectFiltersProps {
      filters: { status?: string; category?: string; search?: string };
      categories?: string[];
      onChange?: (filters: any) => void;
    }

    const ProjectFilters: React.FC<ProjectFiltersProps> = ({ filters, categories = [], onChange }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-wrap gap-4">
            <input type="text" placeholder="Search projects..." value={filters.search || ''} onChange={(e) => onChange?.({ ...filters, search: e.target.value })} className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg" />
            <select value={filters.status || ''} onChange={(e) => onChange?.({ ...filters, status: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
            <select value={filters.category || ''} onChange={(e) => onChange?.({ ...filters, category: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Project Filters Design Component
 */
export function generateProjectFiltersDesign(options: RemainingComponentsOptions = {}): string {
  return `
    interface ProjectFiltersDesignProps {
      filters: { type?: string; client?: string; year?: string };
      onChange?: (filters: any) => void;
    }

    const ProjectFiltersDesign: React.FC<ProjectFiltersDesignProps> = ({ filters, onChange }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-wrap gap-4">
            <select value={filters.type || ''} onChange={(e) => onChange?.({ ...filters, type: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">All Types</option>
              <option value="branding">Branding</option>
              <option value="web">Web Design</option>
              <option value="app">App Design</option>
              <option value="print">Print</option>
            </select>
            <select value={filters.year || ''} onChange={(e) => onChange?.({ ...filters, year: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Project Gallery Component
 */
export function generateProjectGallery(options: RemainingComponentsOptions = {}): string {
  return `
    interface ProjectGalleryProps {
      images: Array<{ url: string; caption?: string }>;
      onImageClick?: (index: number) => void;
    }

    const ProjectGallery: React.FC<ProjectGalleryProps> = ({ images, onImageClick }) => {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <div key={i} className="relative group cursor-pointer" onClick={() => onImageClick?.(i)}>
              <img src={img.url} alt={img.caption || 'Project image'} className="w-full aspect-square object-cover rounded-lg" />
              {img.caption && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 rounded-lg">
                  <p className="text-white text-sm">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    };
  `;
}

/**
 * Generate Project Hero Component
 */
export function generateProjectHero(options: RemainingComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ProjectHeroProps {
      project: { title: string; client: string; category: string; date: string; image?: string; tags?: string[] };
    }

    const ProjectHero: React.FC<ProjectHeroProps> = ({ project }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {project.image && <img src={project.image} alt={project.title} className="w-full h-64 object-cover" />}
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-2">{project.category} • {project.date}</p>
            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
            <p className="text-gray-600 mb-4">Client: {project.client}</p>
            {project.tags && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, i) => <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{tag}</span>)}
              </div>
            )}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Project Testimonial Component
 */
export function generateProjectTestimonial(options: RemainingComponentsOptions = {}): string {
  return `
    interface ProjectTestimonialProps {
      testimonial: { quote: string; author: string; role: string; company: string; avatar?: string };
    }

    const ProjectTestimonial: React.FC<ProjectTestimonialProps> = ({ testimonial }) => {
      return (
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-lg italic text-gray-700 mb-4">"{testimonial.quote}"</p>
          <div className="flex items-center gap-3">
            {testimonial.avatar ? <img src={testimonial.avatar} alt="" className="w-12 h-12 rounded-full" /> : <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">{testimonial.author.charAt(0)}</div>}
            <div>
              <p className="font-medium">{testimonial.author}</p>
              <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Purchase Order Detail Component
 */
export function generatePurchaseOrderDetail(options: RemainingComponentsOptions = {}): string {
  return `
    interface PurchaseOrderDetailProps {
      order: {
        id: string;
        poNumber: string;
        vendor: string;
        date: string;
        status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
        items: Array<{ name: string; quantity: number; unitPrice: number }>;
        subtotal: number;
        tax: number;
        total: number;
        notes?: string;
      };
      onSend?: () => void;
      onReceive?: () => void;
    }

    const PurchaseOrderDetail: React.FC<PurchaseOrderDetailProps> = ({ order, onSend, onReceive }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-bold">PO #{order.poNumber}</h2>
                <p className="text-gray-500">{order.vendor} • {order.date}</p>
              </div>
              <span className="px-3 py-1 h-fit rounded-full text-sm font-medium bg-blue-100 text-blue-800">{order.status}</span>
            </div>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b"><th className="text-left py-2">Item</th><th className="text-right py-2">Qty</th><th className="text-right py-2">Price</th><th className="text-right py-2">Total</th></tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">\${item.unitPrice}</td>
                    <td className="text-right py-2">\${item.quantity * item.unitPrice}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={3} className="text-right py-2">Subtotal</td><td className="text-right py-2">\${order.subtotal}</td></tr>
                <tr><td colSpan={3} className="text-right py-2">Tax</td><td className="text-right py-2">\${order.tax}</td></tr>
                <tr className="font-bold"><td colSpan={3} className="text-right py-2">Total</td><td className="text-right py-2">\${order.total}</td></tr>
              </tfoot>
            </table>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Quote Requests Component
 */
export function generateQuoteRequests(options: RemainingComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface QuoteRequestsProps {
      requests: Array<{
        id: string;
        customer: string;
        email: string;
        service: string;
        description: string;
        submittedAt: string;
        status: 'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined';
        budget?: string;
      }>;
      onSelect?: (id: string) => void;
      onSendQuote?: (id: string) => void;
    }

    const QuoteRequests: React.FC<QuoteRequestsProps> = ({ requests, onSelect, onSendQuote }) => {
      const statusColors = { new: 'bg-red-100 text-red-800', reviewing: 'bg-yellow-100 text-yellow-800', quoted: 'bg-blue-100 text-blue-800', accepted: 'bg-green-100 text-green-800', declined: 'bg-gray-100 text-gray-600' };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b"><h3 className="font-semibold">Quote Requests</h3></div>
          <div className="divide-y">
            {requests.map((req) => (
              <div key={req.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="cursor-pointer" onClick={() => onSelect?.(req.id)}>
                    <p className="font-medium">{req.customer}</p>
                    <p className="text-sm text-gray-500">{req.service}</p>
                  </div>
                  <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[req.status]}\`}>{req.status}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{req.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{req.submittedAt}</span>
                  {req.status === 'new' && onSendQuote && (
                    <button onClick={() => onSendQuote(req.id)} className="px-3 py-1 text-white rounded hover:opacity-90" style={{ backgroundColor: '${primaryColor}' }}>Create Quote</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Recipe Header Component
 */
export function generateRecipeHeader(options: RemainingComponentsOptions = {}): string {
  return `
    interface RecipeHeaderProps {
      recipe: { title: string; description: string; image?: string; prepTime: string; cookTime: string; servings: number; difficulty: 'easy' | 'medium' | 'hard'; rating?: number; author?: string };
    }

    const RecipeHeader: React.FC<RecipeHeaderProps> = ({ recipe }) => {
      const difficultyColors = { easy: 'text-green-600', medium: 'text-yellow-600', hard: 'text-red-600' };

      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {recipe.image && <img src={recipe.image} alt={recipe.title} className="w-full h-64 object-cover" />}
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">{recipe.title}</h1>
            {recipe.author && <p className="text-sm text-gray-500 mb-2">By {recipe.author}</p>}
            <p className="text-gray-600 mb-4">{recipe.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span>⏱️ Prep: {recipe.prepTime}</span>
              <span>🍳 Cook: {recipe.cookTime}</span>
              <span>👥 Serves: {recipe.servings}</span>
              <span className={difficultyColors[recipe.difficulty]}>📊 {recipe.difficulty}</span>
              {recipe.rating && <span>⭐ {recipe.rating}/5</span>}
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Recipe Steps Component
 */
export function generateRecipeSteps(options: RemainingComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface RecipeStepsProps {
      steps: Array<{ step: number; instruction: string; tip?: string; image?: string }>;
    }

    const RecipeSteps: React.FC<RecipeStepsProps> = ({ steps }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-semibold mb-4">Instructions</h3>
          <ol className="space-y-6">
            {steps.map((step) => (
              <li key={step.step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '${primaryColor}' }}>
                  {step.step}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">{step.instruction}</p>
                  {step.tip && <p className="text-sm text-blue-600 mt-1">💡 Tip: {step.tip}</p>}
                  {step.image && <img src={step.image} alt={\`Step \${step.step}\`} className="mt-2 rounded-lg max-w-sm" />}
                </div>
              </li>
            ))}
          </ol>
        </div>
      );
    };
  `;
}

/**
 * Generate Rental Filters Component
 */
export function generateRentalFilters(options: RemainingComponentsOptions = {}): string {
  return `
    interface RentalFiltersProps {
      filters: { category?: string; priceRange?: string; available?: boolean; dates?: { start: string; end: string } };
      categories?: string[];
      onChange?: (filters: any) => void;
    }

    const RentalFilters: React.FC<RentalFiltersProps> = ({ filters, categories = [], onChange }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select value={filters.category || ''} onChange={(e) => onChange?.({ ...filters, category: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.priceRange || ''} onChange={(e) => onChange?.({ ...filters, priceRange: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">Any Price</option>
              <option value="0-50">Under \$50/day</option>
              <option value="50-100">\$50-\$100/day</option>
              <option value="100+">\$100+/day</option>
            </select>
            <input type="date" value={filters.dates?.start || ''} onChange={(e) => onChange?.({ ...filters, dates: { ...filters.dates, start: e.target.value } })} className="px-3 py-2 border rounded-lg" />
            <input type="date" value={filters.dates?.end || ''} onChange={(e) => onChange?.({ ...filters, dates: { ...filters.dates, end: e.target.value } })} className="px-3 py-2 border rounded-lg" />
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Tax Return Filters Component
 */
export function generateTaxReturnFilters(options: RemainingComponentsOptions = {}): string {
  return `
    interface TaxReturnFiltersProps {
      filters: { year?: string; status?: string; type?: string };
      onChange?: (filters: any) => void;
    }

    const TaxReturnFilters: React.FC<TaxReturnFiltersProps> = ({ filters, onChange }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-wrap gap-4">
            <select value={filters.year || ''} onChange={(e) => onChange?.({ ...filters, year: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
            <select value={filters.status || ''} onChange={(e) => onChange?.({ ...filters, status: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">All Status</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Under Review</option>
              <option value="filed">Filed</option>
              <option value="amended">Amended</option>
            </select>
            <select value={filters.type || ''} onChange={(e) => onChange?.({ ...filters, type: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">All Types</option>
              <option value="individual">Individual</option>
              <option value="business">Business</option>
              <option value="trust">Trust</option>
            </select>
          </div>
        </div>
      );
    };
  `;
}
