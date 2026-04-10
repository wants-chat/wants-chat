# App Creator V2 - Implementation Plan

## The Problem

After 2 years of trying different approaches, no concrete outcome. Why?

**Over-engineering trap**: Trying to build a perfect system that handles everything.

**What Rork/Lovable/Bolt do differently**: They don't generate perfect code. They generate *working* code fast, then iterate.

---

## The Solution: Hybrid Architecture

### Core Principle
```
AI picks components → Components are pre-built → Minimal AI code generation
```

**Current System** (slow, error-prone):
```
User prompt → AI analyzes → AI generates ALL code → Errors → Manual fix
```

**New System** (fast, reliable):
```
User prompt → AI outputs JSON config → System assembles pre-built components → Auto-check → Auto-fix if needed
```

---

## Phase 1: Auto-Check & Auto-Repair (Week 1-2)

### 1.1 Build Validation Service

Create `/backend/src/modules/app-creator/services/build-validator.service.ts`:

```typescript
interface BuildResult {
  success: boolean;
  errors: BuildError[];
  warnings: string[];
}

interface BuildError {
  file: string;
  line: number;
  message: string;
  code: string; // TypeScript error code
}

class BuildValidatorService {
  async validateFrontend(outputPath: string): Promise<BuildResult> {
    // Run: cd outputPath/frontend && npm install && npm run build
    // Parse TypeScript errors from output
    // Return structured errors
  }

  async validateBackend(outputPath: string): Promise<BuildResult> {
    // Run: cd outputPath/backend && npm install && npm run build
    // Parse errors
  }

  async validateMobile(outputPath: string): Promise<BuildResult> {
    // Run: cd outputPath/mobile && npx expo export --platform web
    // Parse errors
  }
}
```

### 1.2 Auto-Repair Service

Create `/backend/src/modules/app-creator/services/auto-repair.service.ts`:

```typescript
class AutoRepairService {
  constructor(private claude: ClaudeService) {}

  async repairFile(error: BuildError, fileContent: string): Promise<string> {
    const prompt = `Fix this TypeScript error:

File: ${error.file}
Error at line ${error.line}: ${error.message}

Current code:
\`\`\`typescript
${fileContent}
\`\`\`

Return ONLY the fixed code, no explanation.`;

    return await this.claude.complete(prompt);
  }

  async repairWithRetry(outputPath: string, maxRetries = 3): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      const result = await this.buildValidator.validateAll(outputPath);
      if (result.success) return true;

      // Fix each error
      for (const error of result.errors) {
        const content = await fs.readFile(error.file, 'utf-8');
        const fixed = await this.repairFile(error, content);
        await fs.writeFile(error.file, fixed);
      }
    }
    return false;
  }
}
```

### 1.3 Integration into AppCreatorService

Update `createApp()` method:

```typescript
async createApp(dto: CreateAppDto, onProgress?: ProgressCallback): Promise<GeneratedApp> {
  // ... existing generation code ...

  onProgress?.('validation', 'started', 'Checking generated code...');

  const buildResult = await this.buildValidator.validateAll(outputPath);

  if (!buildResult.success) {
    onProgress?.('repair', 'started', `Fixing ${buildResult.errors.length} errors...`);

    const repaired = await this.autoRepair.repairWithRetry(outputPath, 3);

    if (!repaired) {
      // Return partial success with error details
      return {
        ...app,
        buildStatus: 'partial',
        buildErrors: buildResult.errors,
      };
    }
  }

  onProgress?.('validation', 'completed', 'Build successful!');
  return app;
}
```

---

## Phase 2: Dynamic Blueprint Creation (Week 2-3)

### The Key Insight

Don't try to generate blueprints for every possible app. Instead:

1. **Known app types (309 blueprints)**: Use existing blueprints
2. **Unknown app types**: Generate a minimal blueprint, then store it

### 2.1 Blueprint Generator Service

Create `/backend/src/modules/app-creator/services/blueprint-generator.service.ts`:

```typescript
class BlueprintGeneratorService {
  async generateBlueprint(appType: string, prompt: string): Promise<Blueprint> {
    // Use AI to generate a minimal blueprint
    const response = await this.claude.complete(`
Generate a blueprint JSON for a "${appType}" app.

User request: ${prompt}

Output format:
{
  "appType": "${appType}",
  "industry": "string",
  "coreEntities": ["entity1", "entity2"],
  "requiredPages": [
    { "path": "/", "name": "Home", "sections": ["hero", "features"] },
    { "path": "/list", "name": "List", "sections": ["data-grid"] }
  ],
  "features": ["auth", "crud"],
  "techStack": {
    "database": true,
    "auth": true,
    "fileUpload": false
  }
}

Keep it minimal. Only include what's essential.
Return ONLY valid JSON.
`);

    return JSON.parse(response);
  }
}
```

### 2.2 Blueprint Storage (Database)

Create table in Postgres:

```sql
CREATE TABLE app_blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_type VARCHAR(100) UNIQUE NOT NULL,
  industry VARCHAR(100),
  blueprint JSONB NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_blueprints_app_type ON app_blueprints(app_type);
CREATE INDEX idx_blueprints_industry ON app_blueprints(industry);
```

### 2.3 Smart Blueprint Lookup

Update blueprint resolution logic:

```typescript
async getBlueprint(appType: string, prompt: string): Promise<Blueprint> {
  // 1. Check hardcoded blueprints (fast)
  const hardcoded = this.blueprintRegistry.get(appType);
  if (hardcoded) return hardcoded;

  // 2. Check database (medium)
  const stored = await this.db.query
    .from('app_blueprints')
    .where('app_type', appType)
    .first();

  if (stored) {
    // Increment usage count
    await this.db.query
      .from('app_blueprints')
      .where('id', stored.id)
      .update({ usage_count: stored.usage_count + 1 });
    return stored.blueprint;
  }

  // 3. Generate new blueprint
  const generated = await this.blueprintGenerator.generateBlueprint(appType, prompt);

  // 4. Store for future use
  await this.db.query.from('app_blueprints').insert({
    app_type: appType,
    industry: generated.industry,
    blueprint: generated,
  }).execute();

  return generated;
}
```

---

## Phase 3: Fast Generation (Week 3-4)

### Why Rork/Lovable are Fast

1. **Pre-built components**: They don't generate UI code, they assemble it
2. **JSON config output**: AI outputs configuration, not code
3. **Deterministic assembly**: Same config = same output

### 3.1 Component Registry Enhancement

We already have 309 blueprints and 249 component generators. Now make them machine-readable:

```typescript
// /components/registry.ts
export const componentRegistry = {
  'product-grid': {
    generator: generateProductGrid,
    props: ['entity', 'columns', 'showAddToCart', 'showRatings'],
    category: 'ecommerce',
    description: 'Grid of products with images, prices, cart button',
  },
  'login-form': {
    generator: generateLoginScreen,
    props: ['providers', 'redirectUrl'],
    category: 'auth',
    description: 'Login form with email/password and social providers',
  },
  // ... 200+ components
};
```

### 3.2 AI Config Generation (Not Code)

Instead of AI generating code, have it output config:

```typescript
interface AppConfig {
  name: string;
  entities: EntityConfig[];
  pages: PageConfig[];
  features: string[];
  theme: ThemeConfig;
}

interface PageConfig {
  path: string;
  name: string;
  sections: SectionConfig[];
}

interface SectionConfig {
  component: string; // Key from componentRegistry
  props: Record<string, any>;
}
```

AI prompt becomes:

```typescript
const prompt = `Given this user request: "${userPrompt}"

Output a JSON configuration for the app. Use ONLY these available components:
${Object.keys(componentRegistry).join(', ')}

Format:
{
  "name": "App Name",
  "entities": [{ "name": "product", "fields": [...] }],
  "pages": [
    {
      "path": "/",
      "sections": [
        { "component": "hero-section", "props": { "title": "Welcome" } },
        { "component": "product-grid", "props": { "columns": 3 } }
      ]
    }
  ]
}

Return ONLY valid JSON.`;
```

### 3.3 Deterministic Assembly

```typescript
async assembleApp(config: AppConfig): Promise<GeneratedApp> {
  const files: GeneratedFile[] = [];

  for (const page of config.pages) {
    const pageCode = this.assemblePage(page);
    files.push({
      path: `src/pages/${page.path}/index.tsx`,
      content: pageCode,
    });
  }

  // No AI calls here - just assembly
  return { files, config };
}

assemblePage(page: PageConfig): string {
  const imports: string[] = [];
  const sections: string[] = [];

  for (const section of page.sections) {
    const component = componentRegistry[section.component];
    if (!component) continue;

    // Generate using pre-built generator
    const code = component.generator(section.props);
    sections.push(code);
  }

  return `// Page: ${page.name}\n${imports.join('\n')}\n\n${sections.join('\n\n')}`;
}
```

---

## Phase 4: App Modification (Week 4-5)

### The Diff Approach

Don't regenerate the whole app. Apply targeted changes.

### 4.1 Modification Service

```typescript
class AppModificationService {
  async modifyApp(appId: string, instruction: string): Promise<ModificationResult> {
    // 1. Get existing app config
    const app = await this.getApp(appId);
    const currentConfig = app.config;

    // 2. AI generates a diff
    const diff = await this.generateConfigDiff(currentConfig, instruction);

    // 3. Apply diff to config
    const newConfig = this.applyDiff(currentConfig, diff);

    // 4. Regenerate only affected files
    const changedFiles = this.getChangedFiles(currentConfig, newConfig);

    // 5. Validate changes
    await this.validateChanges(changedFiles);

    return { newConfig, changedFiles };
  }

  async generateConfigDiff(config: AppConfig, instruction: string): Promise<ConfigDiff> {
    const prompt = `Current app config:
${JSON.stringify(config, null, 2)}

User wants to: ${instruction}

Output a JSON diff that describes the changes:
{
  "add": { "pages": [...], "entities": [...] },
  "remove": { "pages": ["path1"], "entities": ["name1"] },
  "modify": {
    "pages": [{ "path": "/", "sections": { "add": [...], "remove": [...] } }]
  }
}

Return ONLY valid JSON.`;

    return JSON.parse(await this.claude.complete(prompt));
  }
}
```

### 4.2 Store App State

```sql
CREATE TABLE generated_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  app_type VARCHAR(100),
  config JSONB NOT NULL,
  output_path TEXT,
  status VARCHAR(50) DEFAULT 'generated',
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES generated_apps(id),
  version INTEGER NOT NULL,
  config JSONB NOT NULL,
  changes_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Implementation Order (Practical)

### Week 1: Auto-Check
- [ ] Create BuildValidatorService
- [ ] Add npm build check for frontend
- [ ] Add npm build check for backend
- [ ] Integrate into createApp flow
- [ ] Test with 5 different app types

### Week 2: Auto-Repair
- [ ] Create AutoRepairService
- [ ] Add Claude API integration for fixes
- [ ] Implement retry loop (max 3 attempts)
- [ ] Log all repairs for analysis
- [ ] Test repair success rate

### Week 3: Dynamic Blueprints
- [ ] Create app_blueprints table
- [ ] Create BlueprintGeneratorService
- [ ] Update blueprint lookup logic
- [ ] Test with unknown app types
- [ ] Monitor generated blueprints quality

### Week 4: Fast Generation
- [ ] Create componentRegistry with metadata
- [ ] Update AI to output JSON config
- [ ] Create deterministic assembly
- [ ] Benchmark: target <10 seconds for simple apps
- [ ] Compare with current generation time

### Week 5: App Modification
- [ ] Create generated_apps table
- [ ] Create AppModificationService
- [ ] Implement config diff generation
- [ ] Implement selective regeneration
- [ ] Add version history

---

## Quick Wins (Do These First)

### 1. Add Build Check (2 hours)
```typescript
// In app-creator.service.ts
async createApp(dto, onProgress) {
  // ... existing code ...

  // Add at the end:
  const buildOk = await this.checkBuild(outputPath);
  if (!buildOk) {
    console.warn('Build failed for', outputPath);
  }

  return { ...app, buildSuccess: buildOk };
}

private async checkBuild(path: string): Promise<boolean> {
  try {
    execSync('npm install && npm run build', {
      cwd: `${path}/frontend`,
      stdio: 'pipe'
    });
    return true;
  } catch {
    return false;
  }
}
```

### 2. Log Generation Stats (1 hour)
```typescript
// Track what works and what doesn't
await this.db.query.from('generation_logs').insert({
  app_type: appType,
  success: buildOk,
  generation_time_ms: Date.now() - startTime,
  error_count: errors.length,
  prompt_length: prompt.length,
}).execute();
```

### 3. Cache Successful Generations (2 hours)
```typescript
// If same app type was generated successfully before, reuse the structure
const cached = await this.db.query
  .from('generation_cache')
  .where('app_type', appType)
  .where('success', true)
  .orderBy('created_at', 'desc')
  .first();

if (cached) {
  // Use cached config as base, only modify entity names/data
}
```

---

## Metrics to Track

| Metric | Current | Target |
|--------|---------|--------|
| Generation time | ~30-60s | <15s |
| Build success rate | ~70% | >95% |
| Supported app types | 309 | Unlimited |
| Modification success | 0% | >80% |

---

## What NOT to Do

1. **Don't build a visual editor** - Focus on generation quality first
2. **Don't support every framework** - React + React Native is enough
3. **Don't over-customize themes** - One good default theme
4. **Don't build deployment** - Users can deploy themselves
5. **Don't try to handle edge cases** - 80/20 rule, cover common cases

---

## Files to Create/Modify

### New Files
```
/services/build-validator.service.ts    # Phase 1
/services/auto-repair.service.ts        # Phase 1
/services/blueprint-generator.service.ts # Phase 2
/services/app-modification.service.ts   # Phase 4
/components/registry.ts                 # Phase 3
/components-native/registry.ts          # Phase 3
```

### Files to Modify
```
/app-creator.service.ts                 # Add validation, repair, dynamic blueprints
/app-creator.module.ts                  # Add new services
```

### Database Tables
```
app_blueprints                          # Phase 2
generated_apps                          # Phase 4
app_versions                            # Phase 4
generation_logs                         # Quick win
generation_cache                        # Quick win
```

---

## Summary

**Stop trying to build perfect code generation.**

Instead:
1. Generate fast using pre-built components
2. Check if it builds
3. Auto-fix if it doesn't
4. Store what works
5. Learn from failures

This is how Rork/Lovable/Bolt work. They're not magic - they're just pragmatic.
