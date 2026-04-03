import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  ResearchGraphState,
  ResearchPlan,
  SubQuery,
  Source,
  Finding,
  FactCheckResult,
  ResearchReport,
  ResearchOutput,
  ResearchDepth,
  DomainConfig,
  SearchResult,
  ExtractedSource,
  KeyFinding,
  AnalysisSection,
  DataPoint,
  Reference,
} from '../interfaces/research.interface';
import { SearchAggregatorService } from '../tools/search.tool';
import { ContentExtractorTool } from '../tools/extractor.tool';
import { AiService } from '../../ai/ai.service';

// ============================================
// Research Graph Node Types
// ============================================

type NodeResult = Partial<ResearchGraphState>;
type NodeFunction = (state: ResearchGraphState) => Promise<NodeResult>;
type ProgressCallback = (step: string, progress: number, message: string, details?: any) => void;

// ============================================
// Research Graph Implementation
// ============================================

@Injectable()
export class ResearchGraph {
  private readonly logger = new Logger(ResearchGraph.name);

  constructor(
    private searchAggregator: SearchAggregatorService,
    private contentExtractor: ContentExtractorTool,
    @Inject(forwardRef(() => AiService))
    private aiService: AiService,
  ) {}

  /**
   * Execute the full research workflow
   */
  async execute(
    query: string,
    sessionId: string,
    userId: string,
    options: {
      depth?: ResearchDepth;
      domain?: string;
      maxSources?: number;
      maxIterations?: number;
      includeDomains?: string[];
      excludeDomains?: string[];
      dateRange?: { from?: string; to?: string };
      outputFormats?: string[];
    },
    progressCallback?: ProgressCallback,
  ): Promise<ResearchGraphState> {
    // Initialize state
    let state: ResearchGraphState = {
      query,
      options: {
        depth: options.depth || 'standard',
        domain: options.domain,
        maxSources: options.maxSources || 20,
        maxIterations: options.maxIterations || 3,
        includeDomains: options.includeDomains,
        excludeDomains: options.excludeDomains,
        dateRange: options.dateRange,
        outputFormats: options.outputFormats as any || ['markdown'],
      },
      sessionId,
      userId,
      domain: null,
      plan: null,
      subQueries: [],
      searchResults: [],
      sources: [],
      findings: [],
      synthesis: null,
      factCheckResults: [],
      needsRevision: false,
      report: null,
      outputs: [],
      iteration: 0,
      maxIterations: options.maxIterations || 3,
      currentStep: 'initializing',
      error: null,
    };

    const emitProgress = (step: string, progress: number, message: string, details?: any) => {
      state.currentStep = step;
      if (progressCallback) {
        progressCallback(step, progress, message, details);
      }
    };

    try {
      // Node 1: Analyze Query
      emitProgress('analyzing', 5, 'Analyzing your research query...');
      state = { ...state, ...(await this.analyzeQueryNode(state)) };

      // Node 2: Create Plan
      emitProgress('planning', 10, 'Creating research plan...');
      state = { ...state, ...(await this.createPlanNode(state)) };

      // Main research loop
      let continueResearch = true;
      while (continueResearch && state.iteration < state.maxIterations) {
        state.iteration++;

        // Node 3: Execute Searches
        emitProgress('searching', 20 + (state.iteration - 1) * 10, `Searching for sources (iteration ${state.iteration})...`, {
          currentSubQuery: state.subQueries[0]?.query,
        });
        state = { ...state, ...(await this.executeSearchesNode(state)) };

        // Node 4: Extract Content
        emitProgress('extracting', 35 + (state.iteration - 1) * 10, 'Extracting content from sources...', {
          sourcesFound: state.searchResults.length,
        });
        state = { ...state, ...(await this.extractContentNode(state, emitProgress)) };

        // Node 5: Analyze Findings
        emitProgress('analyzing', 50 + (state.iteration - 1) * 10, 'Analyzing findings...', {
          sourcesProcessed: state.sources.length,
        });
        state = { ...state, ...(await this.analyzeFindingsNode(state)) };

        // Decision: Need more research?
        continueResearch = await this.needMoreResearch(state);
        if (continueResearch && state.iteration < state.maxIterations) {
          emitProgress('refining', 55 + (state.iteration - 1) * 10, 'Refining search queries for deeper analysis...');
          state = { ...state, ...(await this.refineQueriesNode(state)) };
        }
      }

      // Node 6: Synthesize
      emitProgress('synthesizing', 70, 'Synthesizing research findings...', {
        findingsExtracted: state.findings.length,
      });
      state = { ...state, ...(await this.synthesizeNode(state)) };

      // Node 7: Fact Check
      emitProgress('fact_checking', 80, 'Verifying facts and sources...');
      state = { ...state, ...(await this.factCheckNode(state)) };

      // Handle revision if needed
      if (state.needsRevision && state.iteration < state.maxIterations) {
        emitProgress('revising', 85, 'Revising synthesis based on fact-check results...');
        state = { ...state, ...(await this.synthesizeNode(state)) };
        state.needsRevision = false;
      }

      // Node 8: Generate Outputs
      emitProgress('generating', 90, 'Generating final report...');
      state = { ...state, ...(await this.generateOutputsNode(state)) };

      emitProgress('completed', 100, 'Research complete!');

      return state;
    } catch (error: any) {
      this.logger.error(`Research graph execution failed: ${error.message}`);
      state.error = error.message;
      state.currentStep = 'failed';
      emitProgress('failed', 0, `Research failed: ${error.message}`);
      return state;
    }
  }

  // ============================================
  // Node: Analyze Query
  // ============================================

  private async analyzeQueryNode(state: ResearchGraphState): Promise<NodeResult> {
    this.logger.debug(`Analyzing query: ${state.query}`);

    const prompt = `Analyze this research query and determine:
1. The primary domain/topic (e.g., medical, technology, finance, legal, general)
2. Key entities and concepts mentioned
3. The type of research needed (factual, comparative, analytical, exploratory)
4. Time scope if any (e.g., "2024", "last 5 years")

Query: "${state.query}"

Respond with JSON:
{
  "domain": "string (medical/technology/finance/legal/general)",
  "entities": ["array", "of", "key", "entities"],
  "queryType": "string (factual/comparative/analytical/exploratory)",
  "timeScope": "string or null",
  "complexity": "string (simple/moderate/complex)"
}`;

    try {
      const response = await this.aiService.generateText(prompt, {
        systemMessage: 'You are a research analyst. Analyze queries and respond with valid JSON only.',
        responseFormat: 'json_object',
        temperature: 0.3,
        maxTokens: 500,
        userId: state.userId,
        requestType: 'research',
        conversationId: state.sessionId,
      });

      const analysis = JSON.parse(response);
      const domain = state.options.domain || analysis.domain || 'general';

      return {
        domain,
      };
    } catch (error: any) {
      this.logger.warn(`Query analysis failed: ${error.message}, using default domain`);
      return {
        domain: state.options.domain || 'general',
      };
    }
  }

  // ============================================
  // Node: Create Plan
  // ============================================

  private async createPlanNode(state: ResearchGraphState): Promise<NodeResult> {
    this.logger.debug(`Creating research plan for domain: ${state.domain}`);

    const depth = state.options.depth || 'standard';
    const subQueryCount = this.getSubQueryCount(depth);
    const domainConfig = this.searchAggregator.getDomainConfig(state.domain || 'general');

    const prompt = `Create a research plan for this query:

Query: "${state.query}"
Domain: ${state.domain}
Depth: ${depth} (${subQueryCount} sub-queries needed)

Generate ${subQueryCount} specific sub-queries that will comprehensively answer the main query.
Each sub-query should focus on a different aspect or angle.

Respond with JSON:
{
  "subQueries": [
    {
      "query": "specific search query",
      "purpose": "what this query aims to find",
      "priority": 1-5 (1 is highest priority),
      "keywords": ["key", "terms"]
    }
  ],
  "searchStrategy": "broad/deep/comparative",
  "estimatedSources": number,
  "outputRecommendation": ["markdown", "pdf"] // recommended output formats
}`;

    try {
      const response = await this.aiService.generateText(prompt, {
        systemMessage: 'You are a research planner. Create comprehensive research plans with valid JSON.',
        responseFormat: 'json_object',
        temperature: 0.4,
        maxTokens: 1500,
        userId: state.userId,
        requestType: 'research',
        conversationId: state.sessionId,
      });

      const planData = JSON.parse(response);

      const subQueries: SubQuery[] = planData.subQueries.map((sq: any, index: number) => ({
        id: uuidv4(),
        query: sq.query,
        purpose: sq.purpose,
        priority: sq.priority || index + 1,
        keywords: sq.keywords || [],
      }));

      const plan: ResearchPlan = {
        domain: state.domain || 'general',
        domainConfig,
        subQueries,
        searchStrategy: planData.searchStrategy || 'deep',
        estimatedSources: planData.estimatedSources || state.options.maxSources || 20,
        estimatedTime: this.estimateTime(depth),
        outputRecommendation: planData.outputRecommendation || ['markdown'],
      };

      return {
        plan,
        subQueries,
      };
    } catch (error: any) {
      this.logger.error(`Plan creation failed: ${error.message}`);

      // Create a basic plan as fallback
      const subQueries: SubQuery[] = [
        {
          id: uuidv4(),
          query: state.query,
          purpose: 'Main research query',
          priority: 1,
          keywords: state.query.split(' ').filter((w) => w.length > 3),
        },
        {
          id: uuidv4(),
          query: `${state.query} latest research`,
          purpose: 'Find recent developments',
          priority: 2,
          keywords: [],
        },
      ];

      return {
        plan: {
          domain: state.domain || 'general',
          domainConfig,
          subQueries,
          searchStrategy: 'deep',
          estimatedSources: 20,
          estimatedTime: 180,
          outputRecommendation: ['markdown'],
        },
        subQueries,
      };
    }
  }

  // ============================================
  // Node: Execute Searches
  // ============================================

  private async executeSearchesNode(state: ResearchGraphState): Promise<NodeResult> {
    this.logger.debug(`Executing searches for ${state.subQueries.length} sub-queries`);

    const queries = state.subQueries.map((sq) => sq.query);

    const results = await this.searchAggregator.search(
      queries,
      state.domain || 'general',
      state.options.depth || 'standard',
      {
        includeDomains: state.options.includeDomains,
        excludeDomains: state.options.excludeDomains,
        dateRange: state.options.dateRange,
      },
    );

    return {
      searchResults: [...state.searchResults, ...results.results],
    };
  }

  // ============================================
  // Node: Extract Content
  // ============================================

  private async extractContentNode(
    state: ResearchGraphState,
    emitProgress?: ProgressCallback,
  ): Promise<NodeResult> {
    const maxSources = state.options.maxSources || 20;
    const urlsToExtract = state.searchResults
      .slice(0, maxSources)
      .filter((r) => !state.sources.some((s) => s.url === r.url))
      .map((r) => r.url);

    this.logger.debug(`Extracting content from ${urlsToExtract.length} URLs`);

    let processed = 0;
    const extractedSources = await this.contentExtractor.extractFromUrls(urlsToExtract, {
      useJina: true,
      concurrency: 5,
      progressCallback: (completed, total) => {
        processed = completed;
        if (emitProgress) {
          const progress = 35 + Math.floor((completed / total) * 15);
          emitProgress('extracting', progress, `Extracting content (${completed}/${total})...`, {
            sourcesProcessed: completed,
          });
        }
      },
    });

    // Convert to Source format with relevance scoring
    const newSources: Source[] = extractedSources.map((es) => {
      const searchResult = state.searchResults.find((sr) => sr.url === es.url);
      return {
        id: es.id,
        url: es.url,
        title: es.title,
        content: es.content,
        textContent: es.textContent,
        metadata: es.metadata,
        relevanceScore: searchResult?.score || 0.5,
        credibilityScore: this.calculateCredibilityScore(es.url, state.plan?.domainConfig),
        extractedAt: es.extractedAt,
      };
    });

    return {
      sources: [...state.sources, ...newSources],
    };
  }

  // ============================================
  // Node: Analyze Findings
  // ============================================

  private async analyzeFindingsNode(state: ResearchGraphState): Promise<NodeResult> {
    this.logger.debug(`Analyzing ${state.sources.length} sources for findings`);

    const findings: Finding[] = [];

    // Analyze each source
    for (const source of state.sources) {
      // Skip if source content is too short
      if (source.textContent.length < 100) continue;

      // Truncate content if too long
      const contentToAnalyze = source.textContent.slice(0, 8000);

      const prompt = `Analyze this source content and extract key findings related to the research query.

Research Query: "${state.query}"

Source: ${source.title}
URL: ${source.url}

Content:
${contentToAnalyze}

Extract findings in these categories:
- facts: Verified factual statements
- statistics: Numbers, percentages, data points
- quotes: Notable quotes from experts or sources
- claims: Claims that need verification
- methodology: Research methods mentioned
- conclusions: Conclusions or recommendations

Respond with JSON:
{
  "findings": [
    {
      "type": "fact/statistic/quote/claim/methodology/conclusion",
      "content": "the finding",
      "context": "surrounding context",
      "confidence": 0.0-1.0,
      "tags": ["relevant", "tags"]
    }
  ]
}`;

      try {
        const response = await this.aiService.generateText(prompt, {
          systemMessage: 'You are a research analyst. Extract structured findings from source content. Respond with valid JSON only.',
          responseFormat: 'json_object',
          temperature: 0.2,
          maxTokens: 2000,
          userId: state.userId,
          requestType: 'research',
          conversationId: state.sessionId,
        });

        const analyzed = JSON.parse(response);

        for (const finding of analyzed.findings || []) {
          findings.push({
            id: uuidv4(),
            sourceId: source.id,
            sourceUrl: source.url,
            type: finding.type,
            content: finding.content,
            context: finding.context,
            confidence: finding.confidence || 0.7,
            supportingSources: [source.url],
            tags: finding.tags || [],
          });
        }
      } catch (error: any) {
        this.logger.warn(`Failed to analyze source ${source.url}: ${error.message}`);
      }
    }

    // Cross-reference findings
    const crossReferencedFindings = this.crossReferenceFindings(findings);

    return {
      findings: [...state.findings, ...crossReferencedFindings],
    };
  }

  // ============================================
  // Node: Refine Queries
  // ============================================

  private async refineQueriesNode(state: ResearchGraphState): Promise<NodeResult> {
    this.logger.debug('Refining search queries based on findings');

    const prompt = `Based on the research so far, suggest 2-3 additional queries to fill gaps.

Original Query: "${state.query}"
Findings Summary: Found ${state.findings.length} findings from ${state.sources.length} sources.

Key Topics Covered:
${state.findings.slice(0, 10).map((f) => `- ${f.type}: ${f.content.slice(0, 100)}`).join('\n')}

What aspects are still missing or need more depth?

Respond with JSON:
{
  "newQueries": [
    {
      "query": "specific search query",
      "purpose": "what this aims to find",
      "priority": 1-3
    }
  ]
}`;

    try {
      const response = await this.aiService.generateText(prompt, {
        systemMessage: 'You are a research analyst. Identify gaps and suggest refinements. Respond with valid JSON.',
        responseFormat: 'json_object',
        temperature: 0.4,
        maxTokens: 500,
        userId: state.userId,
        requestType: 'research',
        conversationId: state.sessionId,
      });

      const refinements = JSON.parse(response);

      const newSubQueries: SubQuery[] = (refinements.newQueries || []).map((q: any) => ({
        id: uuidv4(),
        query: q.query,
        purpose: q.purpose,
        priority: q.priority || 3,
        keywords: [],
      }));

      return {
        subQueries: newSubQueries,
        searchResults: [], // Clear for new iteration
      };
    } catch (error: any) {
      this.logger.warn(`Query refinement failed: ${error.message}`);
      return {};
    }
  }

  // ============================================
  // Node: Synthesize
  // ============================================

  private async synthesizeNode(state: ResearchGraphState): Promise<NodeResult> {
    this.logger.debug(`Synthesizing ${state.findings.length} findings`);

    const domainConfig = state.plan?.domainConfig;

    // Group findings by type
    const groupedFindings = this.groupFindings(state.findings);

    const prompt = `Create a comprehensive research synthesis based on these findings.

Research Query: "${state.query}"
Domain: ${state.domain}
${domainConfig?.requiresDisclaimer ? `\nIMPORTANT: Include this disclaimer: "${domainConfig.disclaimerText}"` : ''}

FINDINGS:

Facts:
${groupedFindings.facts.map((f) => `- ${f.content} (confidence: ${f.confidence})`).join('\n')}

Statistics:
${groupedFindings.statistics.map((f) => `- ${f.content}`).join('\n')}

Key Claims:
${groupedFindings.claims.map((f) => `- ${f.content}`).join('\n')}

Conclusions from Sources:
${groupedFindings.conclusions.map((f) => `- ${f.content}`).join('\n')}

Sources Used: ${state.sources.length}

Write a comprehensive synthesis that:
1. Answers the research query directly
2. Presents key findings with evidence
3. Notes any contradictions or debates
4. Acknowledges limitations
5. Provides actionable insights

IMPORTANT:
- Do NOT start with any title or header like "Research Synthesis:" or "# Research Report" - start directly with the content
- Do NOT include the original query in the output
- Use markdown formatting for structure (## for sections, ### for subsections, bullet points, etc.)
- Be thorough but concise.`;

    try {
      let synthesis = await this.aiService.generateText(prompt, {
        systemMessage: `You are a senior research analyst writing a comprehensive research synthesis.
Be objective, cite sources where relevant, and clearly distinguish between well-established facts and emerging/contested claims.
${domainConfig?.citationStyle ? `Use ${domainConfig.citationStyle} citation style.` : ''}
IMPORTANT: Do NOT start your response with any title like "Research Synthesis:", "# Research Report", or similar headers. Start directly with the research content.`,
        temperature: 0.5,
        maxTokens: 4000,
        userId: state.userId,
        requestType: 'research',
        conversationId: state.sessionId,
      });

      // Remove any accidental headers the AI might add
      synthesis = this.removeHeaderPrefixes(synthesis);

      return {
        synthesis,
      };
    } catch (error: any) {
      this.logger.error(`Synthesis generation failed: ${error.message}`);
      return {
        synthesis: 'Unable to generate synthesis due to an error.',
        error: error.message,
      };
    }
  }

  // ============================================
  // Node: Fact Check
  // ============================================

  private async factCheckNode(state: ResearchGraphState): Promise<NodeResult> {
    this.logger.debug('Performing fact checks');

    const factCheckResults: FactCheckResult[] = [];

    // Select findings to fact-check (statistics and key claims)
    const toCheck = state.findings
      .filter((f) => ['statistic', 'claim'].includes(f.type))
      .slice(0, 10);

    for (const finding of toCheck) {
      const prompt = `Verify this ${finding.type} from the research:

Claim: "${finding.content}"
Context: "${finding.context}"
Source: ${finding.sourceUrl}

Check if:
1. The claim is supported by the source
2. The numbers/facts are accurate
3. There are any contradicting sources in our data

Respond with JSON:
{
  "verified": true/false,
  "confidence": 0.0-1.0,
  "supportingEvidence": ["evidence 1", "evidence 2"],
  "conflictingEvidence": ["if any"],
  "notes": "additional context",
  "checkType": "statistic/claim/quote/date/source"
}`;

      try {
        const response = await this.aiService.generateText(prompt, {
          systemMessage: 'You are a fact-checker. Verify claims objectively. Respond with valid JSON.',
          responseFormat: 'json_object',
          temperature: 0.1,
          maxTokens: 500,
          userId: state.userId,
          requestType: 'research',
          conversationId: state.sessionId,
        });

        const checkResult = JSON.parse(response);

        factCheckResults.push({
          id: uuidv4(),
          findingId: finding.id,
          claim: finding.content,
          verified: checkResult.verified,
          confidence: checkResult.confidence || 0.7,
          supportingEvidence: checkResult.supportingEvidence || [],
          conflictingEvidence: checkResult.conflictingEvidence,
          notes: checkResult.notes || '',
          checkType: checkResult.checkType || finding.type as any,
        });
      } catch (error: any) {
        this.logger.warn(`Fact check failed for finding ${finding.id}: ${error.message}`);
      }
    }

    // Determine if revision is needed
    const unverifiedCount = factCheckResults.filter((r) => !r.verified).length;
    const needsRevision = unverifiedCount > factCheckResults.length * 0.3;

    return {
      factCheckResults,
      needsRevision,
    };
  }

  // ============================================
  // Node: Generate Outputs
  // ============================================

  private async generateOutputsNode(state: ResearchGraphState): Promise<NodeResult> {
    this.logger.debug('Generating research outputs');

    const outputs: ResearchOutput[] = [];

    // Generate the full report
    const report = await this.generateReport(state);

    // Always generate markdown
    const markdownContent = this.generateMarkdownReport(report);
    outputs.push({
      id: uuidv4(),
      format: 'markdown',
      content: markdownContent,
      generatedAt: new Date().toISOString(),
    });

    // Generate JSON output if requested
    if (state.options.outputFormats?.includes('json')) {
      outputs.push({
        id: uuidv4(),
        format: 'json',
        content: JSON.stringify(report, null, 2),
        generatedAt: new Date().toISOString(),
      });
    }

    // Note: PDF and DOCX generation would require additional libraries
    // For now, we'll mark them as requiring server-side generation
    const needsServerGen = ['pdf', 'docx', 'pptx'].filter((f) =>
      state.options.outputFormats?.includes(f as any),
    );

    for (const format of needsServerGen) {
      outputs.push({
        id: uuidv4(),
        format: format as any,
        content: undefined, // Will be generated separately
        generatedAt: new Date().toISOString(),
      });
    }

    return {
      report,
      outputs,
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private async generateReport(state: ResearchGraphState): Promise<ResearchReport> {
    const groupedFindings = this.groupFindings(state.findings);

    // Generate a clean title from the query (not the full query text)
    const cleanTitle = await this.generateCleanTitle(state.query, state.userId, state.sessionId);

    // Generate executive summary
    const summaryPrompt = `Write a 2-3 sentence executive summary for this research:

Query: "${state.query}"
Key findings: ${state.findings.length}
Sources: ${state.sources.length}

Main synthesis:
${state.synthesis?.slice(0, 2000)}`;

    let executiveSummary = '';
    try {
      executiveSummary = await this.aiService.generateText(summaryPrompt, {
        systemMessage: 'Write a concise executive summary. Be direct and informative. Do NOT include any headers or titles like "Research Synthesis:" or "Executive Summary:" - just write the summary text directly.',
        temperature: 0.3,
        maxTokens: 300,
        userId: state.userId,
        requestType: 'research',
        conversationId: state.sessionId,
      });
      // Remove any accidental headers the AI might add
      executiveSummary = this.removeHeaderPrefixes(executiveSummary);
    } catch {
      executiveSummary = state.synthesis?.slice(0, 500) || 'Research completed.';
    }

    // Create key findings
    const keyFindings: KeyFinding[] = groupedFindings.facts
      .concat(groupedFindings.conclusions)
      .slice(0, 5)
      .map((f) => ({
        title: f.content.slice(0, 100),
        summary: f.content,
        evidence: [f.context],
        confidence: f.confidence > 0.8 ? 'high' : f.confidence > 0.5 ? 'medium' : 'low',
        sources: f.supportingSources,
      }));

    // Create references
    const references: Reference[] = state.sources.map((s, idx) => ({
      id: `ref-${idx + 1}`,
      title: s.title,
      authors: s.metadata.author ? [s.metadata.author] : undefined,
      url: s.url,
      publishedDate: s.metadata.publishedDate,
      accessedDate: new Date().toISOString().split('T')[0],
      siteName: s.metadata.siteName,
      formattedCitation: this.formatCitation(s, idx + 1, state.plan?.domainConfig?.citationStyle || 'apa'),
    }));

    // Create data points
    const dataPoints: DataPoint[] = groupedFindings.statistics.map((f) => ({
      metric: f.content,
      value: f.content,
      source: f.sourceUrl,
      context: f.context,
      verified: state.factCheckResults.some((fc) => fc.findingId === f.id && fc.verified),
    }));

    return {
      title: cleanTitle,
      query: state.query,
      executiveSummary,
      keyFindings,
      detailedAnalysis: [
        {
          title: 'Overview',
          content: state.synthesis || '',
        },
      ],
      dataAndStatistics: dataPoints,
      limitationsAndCaveats: [
        `This research analyzed ${state.sources.length} sources`,
        `Fact-checking verified ${state.factCheckResults.filter((f) => f.verified).length}/${state.factCheckResults.length} claims`,
        'Some sources may have changed since the research was conducted',
      ],
      conclusions: groupedFindings.conclusions.map((f) => f.content),
      recommendations: [],
      references,
      disclaimer: state.plan?.domainConfig?.disclaimerText,
      generatedAt: new Date().toISOString(),
      metadata: {
        sourcesAnalyzed: state.sources.length,
        researchDepth: state.options.depth || 'standard',
        processingTime: 0, // Would be calculated by the service
        domain: state.domain || 'general',
      },
    };
  }

  private generateMarkdownReport(report: ResearchReport): string {
    let md = `# ${report.title}\n\n`;

    if (report.disclaimer) {
      md += `> **Disclaimer:** ${report.disclaimer}\n\n`;
    }

    md += `## Executive Summary\n\n${report.executiveSummary}\n\n`;

    md += `## Key Findings\n\n`;
    for (const finding of report.keyFindings) {
      md += `### ${finding.title}\n\n`;
      md += `${finding.summary}\n\n`;
      md += `**Confidence:** ${finding.confidence}\n\n`;
    }

    md += `## Detailed Analysis\n\n`;
    for (const section of report.detailedAnalysis) {
      md += `### ${section.title}\n\n${section.content}\n\n`;
    }

    if (report.dataAndStatistics.length > 0) {
      md += `## Data & Statistics\n\n`;
      for (const dp of report.dataAndStatistics) {
        md += `- ${dp.metric}${dp.verified ? ' (verified)' : ''}\n`;
      }
      md += '\n';
    }

    md += `## Limitations\n\n`;
    for (const limitation of report.limitationsAndCaveats) {
      md += `- ${limitation}\n`;
    }
    md += '\n';

    if (report.conclusions.length > 0) {
      md += `## Conclusions\n\n`;
      for (const conclusion of report.conclusions) {
        md += `- ${conclusion}\n`;
      }
      md += '\n';
    }

    md += `## References\n\n`;
    for (const ref of report.references) {
      md += `${ref.id}. ${ref.formattedCitation}\n\n`;
    }

    md += `---\n\n*Generated on ${new Date(report.generatedAt).toLocaleDateString()}*\n`;
    md += `*Sources analyzed: ${report.metadata.sourcesAnalyzed} | Research depth: ${report.metadata.researchDepth}*\n`;

    return md;
  }

  private formatCitation(source: Source, num: number, style: string): string {
    const author = source.metadata.author || source.metadata.siteName || 'Unknown';
    const date = source.metadata.publishedDate
      ? new Date(source.metadata.publishedDate).getFullYear()
      : 'n.d.';
    const accessDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    switch (style) {
      case 'apa':
        return `${author} (${date}). ${source.title}. Retrieved ${accessDate}, from ${source.url}`;
      case 'mla':
        return `${author}. "${source.title}." ${source.metadata.siteName || 'Web'}, ${date}. Web. ${accessDate}.`;
      case 'chicago':
        return `${author}. "${source.title}." Accessed ${accessDate}. ${source.url}.`;
      case 'ieee':
        return `[${num}] ${author}, "${source.title}," ${source.metadata.siteName || 'Online'}. [Online]. Available: ${source.url}. [Accessed: ${accessDate}].`;
      default:
        return `${author}. ${source.title}. ${source.url}`;
    }
  }

  private getSubQueryCount(depth: ResearchDepth): number {
    const map: Record<ResearchDepth, number> = {
      quick: 2,
      standard: 4,
      deep: 6,
      exhaustive: 10,
    };
    return map[depth];
  }

  private estimateTime(depth: ResearchDepth): number {
    const map: Record<ResearchDepth, number> = {
      quick: 60,
      standard: 180,
      deep: 420,
      exhaustive: 900,
    };
    return map[depth];
  }

  private calculateCredibilityScore(url: string, domainConfig?: DomainConfig): number {
    let score = 0.5;

    // Boost for authoritative domains
    const authoritative = [
      '.gov',
      '.edu',
      'nature.com',
      'science.org',
      'pubmed.ncbi.nlm.nih.gov',
      'arxiv.org',
      'ieee.org',
      ...(domainConfig?.authoritativeDomains || []),
    ];

    for (const domain of authoritative) {
      if (url.includes(domain)) {
        score += 0.3;
        break;
      }
    }

    // Boost for preferred domains
    for (const domain of domainConfig?.preferredDomains || []) {
      if (url.includes(domain)) {
        score += 0.1;
        break;
      }
    }

    return Math.min(score, 1.0);
  }

  private async needMoreResearch(state: ResearchGraphState): Promise<boolean> {
    // Simple heuristic: need more if we have few findings or low confidence
    const avgConfidence =
      state.findings.reduce((sum, f) => sum + f.confidence, 0) / (state.findings.length || 1);

    return (
      state.findings.length < 5 ||
      avgConfidence < 0.6 ||
      state.sources.length < (state.options.maxSources || 20) * 0.5
    );
  }

  private crossReferenceFindings(findings: Finding[]): Finding[] {
    // Find findings that are supported by multiple sources
    const contentMap = new Map<string, Finding[]>();

    for (const finding of findings) {
      // Normalize content for comparison
      const normalized = finding.content.toLowerCase().slice(0, 100);
      const existing = contentMap.get(normalized) || [];
      existing.push(finding);
      contentMap.set(normalized, existing);
    }

    // Update supporting sources for similar findings
    return findings.map((finding) => {
      const normalized = finding.content.toLowerCase().slice(0, 100);
      const similar = contentMap.get(normalized) || [];

      if (similar.length > 1) {
        return {
          ...finding,
          supportingSources: [...new Set(similar.map((f) => f.sourceUrl))],
          confidence: Math.min(finding.confidence + 0.1 * (similar.length - 1), 1.0),
        };
      }

      return finding;
    });
  }

  private groupFindings(findings: Finding[]): Record<string, Finding[]> {
    return {
      facts: findings.filter((f) => f.type === 'fact'),
      statistics: findings.filter((f) => f.type === 'statistic'),
      quotes: findings.filter((f) => f.type === 'quote'),
      claims: findings.filter((f) => f.type === 'claim'),
      methodology: findings.filter((f) => f.type === 'methodology'),
      conclusions: findings.filter((f) => f.type === 'conclusion'),
    };
  }

  /**
   * Generate a clean, concise title from the research query
   */
  private async generateCleanTitle(
    query: string,
    userId: string,
    sessionId: string,
  ): Promise<string> {
    try {
      const titlePrompt = `Generate a short, professional title (max 8 words) for a research report about this topic.
Do NOT include "Research:" or "Research Report:" prefix - just the topic title.

Query: "${query}"

Examples:
- "can you research about new ralph waggum claude code plugin" → "Ralph Waggum Claude Code Plugin"
- "research the latest AI developments in 2024" → "Latest AI Developments 2024"
- "find information about climate change effects" → "Climate Change Effects"

Return ONLY the title, nothing else.`;

      const title = await this.aiService.generateText(titlePrompt, {
        systemMessage: 'Generate a concise, professional title. Return only the title text, no quotes or extra formatting.',
        temperature: 0.3,
        maxTokens: 50,
        userId,
        requestType: 'research',
        conversationId: sessionId,
      });

      // Clean up the title
      return title.trim().replace(/^["']|["']$/g, '').replace(/^#+ /, '');
    } catch {
      // Fallback: extract key words from query
      return this.extractTitleFromQuery(query);
    }
  }

  /**
   * Extract a title from the query by removing common prefixes
   */
  private extractTitleFromQuery(query: string): string {
    // Remove common research request patterns
    let title = query
      .replace(/^(can you |please |could you |I want to |I need to )/i, '')
      .replace(/^(research|search|find|look up|investigate|analyze|explore)( about| for| on| into)?/i, '')
      .replace(/^(information|info|details|data)( about| on| for)?/i, '')
      .trim();

    // Capitalize first letter of each word
    title = title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Limit length
    if (title.length > 60) {
      title = title.slice(0, 57) + '...';
    }

    return title || 'Research Report';
  }

  /**
   * Remove common header prefixes that AI might accidentally add
   */
  private removeHeaderPrefixes(text: string): string {
    if (!text) return text;

    // Remove common header patterns at the start
    const patterns = [
      /^#+\s*Research Synthesis:?\s*/i,
      /^Research Synthesis:?\s*/i,
      /^#+\s*Research Report:?\s*/i,
      /^Research Report:?\s*/i,
      /^#+\s*Executive Summary:?\s*/i,
      /^Executive Summary:?\s*/i,
      /^#+\s*Summary:?\s*/i,
      /^Summary:?\s*/i,
    ];

    let cleaned = text.trim();
    for (const pattern of patterns) {
      cleaned = cleaned.replace(pattern, '');
    }

    return cleaned.trim();
  }
}
