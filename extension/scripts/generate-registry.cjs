const fs = require('fs');
const path = require('path');
const { kebabCase } = require('change-case');

// Read backend tools registry as SINGLE SOURCE OF TRUTH
const backendRegistryPath = path.join(__dirname, '../../backend/src/data/tools-registry.ts');
const backendRegistryContent = fs.readFileSync(backendRegistryPath, 'utf-8');

// Parse categories from backend
function parseBackendCategories(content) {
  const categories = [];
  const categoryRegex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*icon:\s*'([^']+)',\s*description:\s*'([^']+)'\s*\}/g;

  let match;
  while ((match = categoryRegex.exec(content)) !== null) {
    categories.push({
      id: match[1],
      name: match[2],
      icon: match[3],
      description: match[4]
    });
  }
  return categories;
}

// Parse tools from backend
function parseBackendTools(content) {
  const tools = [];
  const toolRegex = /\{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*description:\s*'([^']+)',\s*icon:\s*'([^']+)',\s*type:\s*'([^']+)',\s*category:\s*'([^']+)'\s*\}/g;

  let match;
  while ((match = toolRegex.exec(content)) !== null) {
    tools.push({
      id: match[1],
      title: match[2],
      description: match[3],
      icon: match[4],
      type: match[5],
      category: match[6]
    });
  }
  return tools;
}

// Parse backend data
const backendCategories = parseBackendCategories(backendRegistryContent);
const backendTools = parseBackendTools(backendRegistryContent);

console.log(`Backend: ${backendCategories.length} categories, ${backendTools.length} tools`);

// Create lookup map for backend tools by ID
const backendToolsMap = new Map();
backendTools.forEach(tool => {
  backendToolsMap.set(tool.id, tool);
});

// Read all tool component files from frontend
const toolsDir = path.join(__dirname, '../../frontend/src/components/tools');
const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('Tool.tsx'));

console.log(`Frontend: ${files.length} tool components`);

// Icon mapping from backend icon names to emojis
const iconToEmoji = {
  'type': '📝', 'lock': '🔐', 'calculator': '🧮', 'repeat': '🔄', 'sparkles': '✨',
  'clock': '⏰', 'image': '🖼️', 'pen-tool': '✍️', 'palette': '🎨', 'briefcase': '💼',
  'megaphone': '📣', 'code': '💻', 'code-2': '💻', 'heart': '❤️', 'activity': '📈',
  'dollar-sign': '💵', 'chef-hat': '👨‍🍳', 'home': '🏠', 'flower': '🌸', 'car': '🚗',
  'paw-print': '🐾', 'plane': '✈️', 'star': '⭐', 'graduation-cap': '🎓', 'music': '🎵',
  'scissors': '✂️', 'gamepad-2': '🎮', 'check-square': '✅', 'building-2': '🏢',
  'user-check': '👔', 'cloud': '☁️', 'stethoscope': '🩺', 'factory': '🏭', 'truck': '🚚',
  'zap': '⚡', 'church': '⛪', 'baby': '👶', 'hash': '#️⃣', 'eye': '👁️', 'git-compare': '🔀',
  'file-json': '📋', 'flip-horizontal': '↔️', 'sort-asc': '📊', 'replace': '🔄',
  'filter': '🔍', 'file-diff': '📝', 'regex': '🔤', 'link': '🔗', 'shield': '🛡️',
  'key': '🔑', 'binary': '01', 'percent': '%', 'tag': '🏷️', 'calendar': '📅',
  'receipt': '🧾', 'banknote': '💵', 'calendar-range': '📆', 'bar-chart': '📊',
  'function-square': '➗', 'landmark': '🏛️', 'divide': '➗', 'ratio': '⚖️',
  'thermometer': '🌡️', 'ruler': '📏', 'scale': '⚖️', 'timer': '⏱️', 'footprints': '👣',
  'hard-drive': '💾', 'gauge': '🔢', 'qr-code': '📱', 'align-left': '📝', 'wifi': '📶',
  'barcode': '📊', 'user': '👤', 'text': '📝', 'alarm-clock': '⏰', 'globe': '🌍',
  'calendar-check': '✅', 'cake': '🎂', 'users': '👥', 'file-minus': '📁', 'pipette': '🎨',
  'wand-2': '✨', 'eraser': '🧹', 'maximize': '🔍', 'droplets': '💧', 'stamp': '📬',
  'paintbrush': '🖌️', 'trash-2': '🗑️', 'refresh-cw': '🔄', 'droplet': '💧', 'film': '🎬',
  'scan': '📷', 'mail': '📧', 'book-open': '📖', 'newspaper': '📰', 'share-2': '📤',
  'languages': '🌐', 'spell-check': '✓', 'file-text': '📄', 'linkedin': '💼', 'mic': '🎤',
  'book': '📚', 'quote': '💬', 'hexagon': '⬡', 'video': '🎬', 'user-circle': '👤',
  'layout': '📐', 'credit-card': '💳', 'frame': '🖼️', 'file-image': '🖼️',
  'clapperboard': '🎬', 'feather': '✒️', 'smile': '😊', 'disc': '💿', 'monitor': '🖥️',
  'sticker': '🏷️', 'grid': '📊', 'shuffle': '🔀', 'help-circle': '❓', 'list-ordered': '📝',
  'mail-plus': '📬', 'shopping-bag': '🛍️', 'message-circle': '💬', 'clipboard': '📋',
  'file-check': '✅', 'youtube': '📺', 'twitter': '🐦', 'minimize': '📦', 'database': '🗄️',
  'route': '🛣️', 'git-branch': '🔀', 'flame': '🔥', 'moon': '🌙', 'heart-pulse': '💓',
  'dumbbell': '🏋️', 'trophy': '🏆', 'waves': '🌊', 'wallet': '👛', 'piggy-bank': '🐷',
  'trending-down': '📉', 'line-chart': '📈', 'coins': '🪙', 'beef': '🥩', 'coffee': '☕',
  'cookie': '🍪', 'utensils-crossed': '🍴', 'hammer': '🔨', 'sofa': '🛋️', 'leaf': '🌿',
  'tree-pine': '🌲', 'sun': '☀️', 'cloud-rain': '🌧️', 'snowflake': '❄️', 'wind': '💨',
  'fuel': '⛽', 'car-wrench': '🔧', 'car-front': '🚗', 'dog': '🐕', 'cat': '🐈',
  'fish': '🐟', 'bird': '🐦', 'map-pin': '📍', 'compass': '🧭', 'luggage': '🧳',
  'hotel': '🏨', 'camera': '📷', 'umbrella': '☂️', 'map': '🗺️', 'navigation': '🧭',
  'anchor': '⚓', 'ship': '🚢', 'train': '🚂', 'bus': '🚌', 'gem': '💎', 'gift': '🎁',
  'calendar-days': '📆', 'smartphone': '📱', 'laptop': '💻', 'watch': '⌚',
  'headphones': '🎧', 'tv': '📺', 'book-marked': '📑', 'pencil': '✏️', 'puzzle': '🧩',
  'dice-1': '🎲', 'spade': '♠️', 'party-popper': '🎉', 'popcorn': '🍿', 'ticket': '🎟️',
  'radio': '📻', 'podcast': '🎙️', 'guitar': '🎸', 'piano': '🎹', 'drum': '🥁',
  'volume-2': '🔊', 'mic-2': '🎤', 'list-todo': '📝', 'clipboard-list': '📋',
  'folder-kanban': '📁', 'clipboard-check': '✅', 'list-checks': '✓', 'building': '🏢',
  'store': '🏪', 'gavel': '⚖️', 'badge-check': '✅', 'user-plus': '👤', 'user-cog': '⚙️',
  'file-signature': '📝', 'phone': '📞', 'at-sign': '@', 'send': '📤', 'bell': '🔔',
  'alert-circle': '⚠️', 'info': 'ℹ️', 'check-circle': '✅', 'x-circle': '❌',
  'alert-triangle': '⚠️', 'shield-check': '🛡️', 'shield-alert': '⚠️', 'unlock': '🔓',
  'key-round': '🔑', 'medal': '🏅', 'award': '🏆', 'crown': '👑', 'swords': '⚔️',
  'rocket': '🚀', 'mountain': '🏔️', 'tent': '⛺', 'backpack': '🎒', 'tool': '🔧',
  'wrench': '🔧', 'pill': '💊', 'bed': '🛏️', 'apple': '🍎', 'carrot': '🥕',
};

// Check if tool should be marked as Pro (AI tools)
function isPro(type) {
  return type.startsWith('ai-') || type === 'ai-writing' || type === 'ai-creative' || type === 'ai-business' || type === 'ai-marketing';
}

// Generate the registry
let output = `import { lazy, ComponentType } from 'react';

// Lazy load helper
const lazyTool = (importFn: () => Promise<any>) => {
  return lazy(async () => {
    const module = await importFn();
    return { default: module.default || module[Object.keys(module)[0]] };
  });
};

export interface ToolInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  keywords: string[];
  isPro?: boolean;
  component: ComponentType<any>;
}

export interface ToolCategoryInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Tool categories (from backend - single source of truth)
export const TOOL_CATEGORIES: ToolCategoryInfo[] = [
${backendCategories.map(c => `  { id: '${c.id}', name: '${c.name}', icon: '${iconToEmoji[c.icon] || '🔧'}', description: '${c.description}' },`).join('\n')}
];

// All tools registry
export const TOOLS_REGISTRY: ToolInfo[] = [
`;

// Generate entries for each tool component
let count = 0;
files.forEach((file) => {
  const componentName = file.replace('.tsx', '');
  const id = kebabCase(componentName.replace(/Tool$/, ''));

  // Get tool data from backend (single source of truth)
  const backendTool = backendToolsMap.get(id);

  if (!backendTool) {
    console.error(`ERROR: No backend entry for ${id} (${file})`);
    process.exit(1);
  }

  count++;
  const icon = iconToEmoji[backendTool.icon] || '🔧';
  const keywords = [
    ...backendTool.title.toLowerCase().split(/\s+/),
    ...backendTool.description.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  ].slice(0, 8);
  const pro = isPro(backendTool.type);

  output += `  {
    id: '${backendTool.id}',
    name: '${backendTool.title}',
    description: '${backendTool.description.replace(/'/g, "\\'")}',
    category: '${backendTool.category}',
    icon: '${icon}',
    keywords: ${JSON.stringify([...new Set(keywords)])},${pro ? '\n    isPro: true,' : ''}
    component: lazyTool(() => import('@tools/${componentName}')),
  },
`;
});

output += `];

// Export counts
export const TOTAL_TOOLS_COUNT = TOOLS_REGISTRY.length;

// Category counts (computed from registry)
export const CATEGORY_COUNTS: Record<string, number> = TOOLS_REGISTRY.reduce((acc, tool) => {
  acc[tool.category] = (acc[tool.category] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
`;

// Write the file
fs.writeFileSync(path.join(__dirname, '../src/tools-registry.tsx'), output);

console.log(`\nGenerated registry: ${count} tools, ${backendCategories.length} categories`);

// Show category distribution
const categoryStats = {};
files.forEach(file => {
  const id = kebabCase(file.replace('Tool.tsx', ''));
  const backendTool = backendToolsMap.get(id);
  if (backendTool) {
    const cat = backendTool.category;
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  }
});

console.log('\nCategory distribution:');
Object.entries(categoryStats)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([cat, count]) => {
    const catName = backendCategories.find(c => c.id === cat)?.name || cat;
    console.log(`  ${catName}: ${count}`);
  });
