import { Injectable, Logger } from '@nestjs/common';
import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface BuildError {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string; // TypeScript error code like TS2339
  severity: 'error' | 'warning';
  rawLine: string;
}

export interface BuildResult {
  success: boolean;
  platform: 'frontend' | 'backend' | 'mobile';
  errors: BuildError[];
  warnings: string[];
  duration: number;
  output: string;
}

export interface FullBuildResult {
  success: boolean;
  frontend: BuildResult | null;
  backend: BuildResult | null;
  mobile: BuildResult | null;
  totalErrors: number;
  totalWarnings: number;
  duration: number;
}

@Injectable()
export class BuildValidatorService {
  private readonly logger = new Logger(BuildValidatorService.name);

  /**
   * Validate all platforms (frontend, backend, mobile)
   */
  async validateAll(outputPath: string): Promise<FullBuildResult> {
    const startTime = Date.now();

    const [frontend, backend, mobile] = await Promise.all([
      this.validateFrontend(outputPath),
      this.validateBackend(outputPath),
      this.validateMobile(outputPath),
    ]);

    const totalErrors =
      (frontend?.errors.length || 0) +
      (backend?.errors.length || 0) +
      (mobile?.errors.length || 0);

    const totalWarnings =
      (frontend?.warnings.length || 0) +
      (backend?.warnings.length || 0) +
      (mobile?.warnings.length || 0);

    return {
      success: totalErrors === 0,
      frontend,
      backend,
      mobile,
      totalErrors,
      totalWarnings,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Validate frontend (React/Vite) build
   */
  async validateFrontend(outputPath: string): Promise<BuildResult | null> {
    const frontendPath = path.join(outputPath, 'frontend');

    if (!(await this.dirExists(frontendPath))) {
      this.logger.warn(`Frontend directory not found: ${frontendPath}`);
      return null;
    }

    return this.runBuild(frontendPath, 'frontend');
  }

  /**
   * Validate backend (Hono/Node) build
   */
  async validateBackend(outputPath: string): Promise<BuildResult | null> {
    const backendPath = path.join(outputPath, 'backend');

    if (!(await this.dirExists(backendPath))) {
      this.logger.warn(`Backend directory not found: ${backendPath}`);
      return null;
    }

    return this.runBuild(backendPath, 'backend');
  }

  /**
   * Validate mobile (React Native/Expo) build
   * Uses TypeScript check instead of full Expo build for speed
   */
  async validateMobile(outputPath: string): Promise<BuildResult | null> {
    const mobilePath = path.join(outputPath, 'mobile');

    if (!(await this.dirExists(mobilePath))) {
      this.logger.warn(`Mobile directory not found: ${mobilePath}`);
      return null;
    }

    return this.runBuild(mobilePath, 'mobile', true);
  }

  /**
   * Run npm install and build
   */
  private async runBuild(
    projectPath: string,
    platform: 'frontend' | 'backend' | 'mobile',
    typeCheckOnly = false,
  ): Promise<BuildResult> {
    const startTime = Date.now();
    const errors: BuildError[] = [];
    const warnings: string[] = [];
    let output = '';

    try {
      // Check if package.json exists
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (!(await this.fileExists(packageJsonPath))) {
        return {
          success: false,
          platform,
          errors: [{
            file: 'package.json',
            line: 0,
            column: 0,
            message: 'package.json not found',
            code: 'MISSING_PACKAGE_JSON',
            severity: 'error',
            rawLine: '',
          }],
          warnings: [],
          duration: Date.now() - startTime,
          output: 'package.json not found',
        };
      }

      // Install dependencies
      this.logger.log(`Installing dependencies for ${platform}...`);
      try {
        const installResult = await execAsync('npm install --legacy-peer-deps 2>&1', {
          cwd: projectPath,
          timeout: 120000, // 2 minutes
        });
        output += installResult.stdout + '\n';
      } catch (installError: any) {
        this.logger.warn(`npm install warning for ${platform}: ${installError.message}`);
        output += installError.stdout || '';
        output += installError.stderr || '';
      }

      // Run TypeScript check or build
      this.logger.log(`Building ${platform}...`);
      const buildCommand = typeCheckOnly
        ? 'npx tsc --noEmit 2>&1'
        : 'npm run build 2>&1';

      try {
        const buildResult = await execAsync(buildCommand, {
          cwd: projectPath,
          timeout: 180000, // 3 minutes
        });
        output += buildResult.stdout + '\n';
        this.logger.log(`${platform} build successful`);
      } catch (buildError: any) {
        const errorOutput = buildError.stdout + (buildError.stderr || '');
        output += errorOutput;

        // Parse TypeScript errors
        const parsedErrors = this.parseTypeScriptErrors(errorOutput, projectPath);
        errors.push(...parsedErrors);

        this.logger.warn(`${platform} build failed with ${parsedErrors.length} errors`);
      }

      return {
        success: errors.length === 0,
        platform,
        errors,
        warnings,
        duration: Date.now() - startTime,
        output,
      };
    } catch (error: any) {
      this.logger.error(`Build validation failed for ${platform}:`, error.message);
      return {
        success: false,
        platform,
        errors: [{
          file: 'unknown',
          line: 0,
          column: 0,
          message: error.message,
          code: 'BUILD_ERROR',
          severity: 'error',
          rawLine: '',
        }],
        warnings: [],
        duration: Date.now() - startTime,
        output: error.message,
      };
    }
  }

  /**
   * Parse TypeScript compiler errors from output
   */
  private parseTypeScriptErrors(output: string, basePath: string): BuildError[] {
    const errors: BuildError[] = [];
    const lines = output.split('\n');

    // TypeScript error format: src/file.ts(10,5): error TS2339: Property 'foo' does not exist
    // Or: src/file.ts:10:5 - error TS2339: Property 'foo' does not exist
    const errorPatterns = [
      // Format: file(line,col): error TSxxxx: message
      /^(.+?)\((\d+),(\d+)\):\s*(error|warning)\s+(TS\d+):\s*(.+)$/,
      // Format: file:line:col - error TSxxxx: message
      /^(.+?):(\d+):(\d+)\s*-\s*(error|warning)\s+(TS\d+):\s*(.+)$/,
      // Vite/esbuild format: file:line:col: error: message
      /^(.+?):(\d+):(\d+):\s*(error|warning):\s*(.+)$/,
    ];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      for (const pattern of errorPatterns) {
        const match = trimmedLine.match(pattern);
        if (match) {
          const [, file, lineNum, colNum, severity, codeOrMsg, message] = match;
          errors.push({
            file: path.isAbsolute(file) ? file : path.join(basePath, file),
            line: parseInt(lineNum, 10),
            column: parseInt(colNum, 10),
            message: message || codeOrMsg,
            code: message ? codeOrMsg : 'ERROR',
            severity: (severity?.toLowerCase() === 'warning' ? 'warning' : 'error') as 'error' | 'warning',
            rawLine: trimmedLine,
          });
          break;
        }
      }
    }

    // Deduplicate errors by file+line+message
    const seen = new Set<string>();
    return errors.filter((e) => {
      const key = `${e.file}:${e.line}:${e.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Get file content with context around error line
   */
  async getErrorContext(
    error: BuildError,
    contextLines = 5,
  ): Promise<{ before: string[]; errorLine: string; after: string[] } | null> {
    try {
      const content = await fs.readFile(error.file, 'utf-8');
      const lines = content.split('\n');

      const lineIndex = error.line - 1;
      if (lineIndex < 0 || lineIndex >= lines.length) {
        return null;
      }

      const before = lines.slice(
        Math.max(0, lineIndex - contextLines),
        lineIndex,
      );
      const errorLine = lines[lineIndex];
      const after = lines.slice(
        lineIndex + 1,
        Math.min(lines.length, lineIndex + contextLines + 1),
      );

      return { before, errorLine, after };
    } catch {
      return null;
    }
  }

  /**
   * Read file content for repair
   */
  async readFileContent(filePath: string): Promise<string | null> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
  }

  /**
   * Write repaired content to file
   */
  async writeFileContent(filePath: string, content: string): Promise<boolean> {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return true;
    } catch (error) {
      this.logger.error(`Failed to write file: ${filePath}`, error);
      return false;
    }
  }

  private async dirExists(dirPath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(dirPath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(filePath);
      return stat.isFile();
    } catch {
      return false;
    }
  }
}
