import { FeatureExtractorService } from '../src/modules/app-builder/services/feature-extractor.service';
import { ReactRendererService } from '../src/modules/app-builder/services/react-renderer.service';
import { APP_TYPES_REGISTRY } from '../src/modules/app-builder/registries/app-types';
import { COMPONENTS_BY_ID } from '../src/modules/app-builder/registries/components';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = '/tmp/social-network-test';
const appTypeId = 'social-network';
const appType = APP_TYPES_REGISTRY[appTypeId];

if (!appType) {
  console.error('App type not found:', appTypeId);
  process.exit(1);
}

console.log('Generating:', appType.name);

const featureExtractor = new FeatureExtractorService();
const reactRenderer = new ReactRendererService();

const featureResult = featureExtractor.extract('social network app', appType);
console.log('Features:', featureResult.features.map(f => f.id).join(', '));

const featureIds = featureResult.features.map(f => f.id);
const pages = featureExtractor.getPages(featureIds, appType);
const componentIds = featureExtractor.getComponents(featureIds, appType);
const entities = featureExtractor.getEntities(featureIds);

console.log('Pages:', pages.length);
console.log('Entities:', entities.map(e => e.name).join(', '));

const componentMap = new Map(
  componentIds.map(id => [id, COMPONENTS_BY_ID.get(id)]).filter(([_, c]) => c !== undefined) as [string, any][]
);

const generatedKeys = {
  appId: 'test-app-id',
  databaseName: 'test_db',
  serviceRoleKey: 'test-service-key',
  anonKey: 'test-anon-key',
  jwtSecret: 'test-jwt-secret',
};

reactRenderer.setFeatures(featureResult.features);

const pageInstances = pages.map(page => ({
  id: page.id,
  route: page.route,
  title: page.title,
  templateId: page.templateId || 'default',
  section: page.section,
  components: (page.components || []).map((compId, idx) => ({
    slotId: `slot-${idx}`,
    componentId: compId,
    props: {},
  })),
  dataFetching: [],
  auth: {
    required: page.authRequired,
    roles: page.roles,
  },
}));

const mockBranding = {
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  fontFamily: 'Inter',
  borderRadius: '0.5rem',
  logoUrl: null,
};

console.log('\nGenerating frontend...');
const frontendFiles = reactRenderer.generateAll(
  pageInstances,
  componentMap,
  'SocialNetwork',
  generatedKeys,
  mockBranding,
  'modern',
  'blue',
  appTypeId,
);
console.log('Frontend files:', frontendFiles.length);

// Save frontend files first (before attempting backend which may fail)
fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

for (const file of frontendFiles) {
  const filePath = path.join(OUTPUT_DIR, file.path);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, file.content);
}
console.log('Frontend files saved to:', OUTPUT_DIR);

// Try to generate backend (may fail but frontend is already saved)
try {
  const { HonoRendererService } = require('../src/modules/app-builder/services/hono-renderer.service');
  const { SchemaDeriverService } = require('../src/modules/app-builder/services/schema-deriver.service');

  const honoRenderer = new HonoRendererService();
  const schemaDeriver = new SchemaDeriverService();

  // Derive schema
  const schemaResult = schemaDeriver.derive(componentIds, entities, appTypeId);
  console.log('\nSchema tables:', schemaResult.tables.map(t => t.name).join(', '));

  // Get API routes
  const apiRoutes = featureExtractor.getApiRoutes(featureIds);
  console.log('API routes:', apiRoutes.length);

  console.log('\nGenerating backend...');
  const backendFiles = honoRenderer.generateAll(
    entities,
    apiRoutes,
    schemaResult,
    'SocialNetwork',
    generatedKeys,
  );
  console.log('Backend files:', backendFiles.length);

  // Save backend files
  for (const file of backendFiles) {
    const filePath = path.join(OUTPUT_DIR, file.path);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, file.content);
  }
} catch (backendError) {
  console.error('\nBackend generation failed:', (backendError as Error).message);
  console.log('Frontend files were already saved successfully.');
}

console.log('\nFiles saved to:', OUTPUT_DIR);
console.log('\nGenerated pages:');
frontendFiles
  .filter(f => f.path.includes('/pages/'))
  .forEach(f => console.log(' -', f.path));

// Show sample of landing page
const landingPage = frontendFiles.find(f => f.path.toLowerCase().includes('landing'));
if (landingPage) {
  console.log('\n=== LANDING PAGE (first 80 lines) ===');
  console.log(landingPage.content.split('\n').slice(0, 80).join('\n'));
}

// Show sample of feed page
const feedPage = frontendFiles.find(f => f.path.toLowerCase().includes('feed'));
if (feedPage) {
  console.log('\n=== FEED PAGE (first 80 lines) ===');
  console.log(feedPage.content.split('\n').slice(0, 80).join('\n'));
}
