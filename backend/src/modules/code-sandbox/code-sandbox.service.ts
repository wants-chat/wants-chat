/**
 * ⚠️ SECURITY — SINGLE-TENANT USE ONLY
 *
 * This module is NOT a real sandbox. It is designed for self-hosted,
 * single-tenant open-source deployments where the operator and the
 * executing user are the same person.
 *
 * In its current form:
 *   - Python runs as a plain child_process on the host. Any authed
 *     user can read host env vars, filesystem, and internal network.
 *   - JavaScript uses node:vm, which Node's own docs warn is not a
 *     security boundary. Host-realm constructors leak.
 *
 * DO NOT expose this feature to untrusted users or deploy it in a
 * multi-tenant / SaaS context without first completing:
 *   - #69 (containerize Python executor)
 *   - #70 (replace node:vm with isolated-vm)
 *   - #71 (cap concurrent executions)
 *   - #72 (move rate limiter to Redis)
 */
import {
  Injectable,
  Logger,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as vm from 'vm';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryUsageKb: number;
}

type SupportedLanguage = 'javascript' | 'python' | 'typescript';

const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  'javascript',
  'python',
  'typescript',
];

const MAX_TIMEOUT_MS = 10_000;
const MAX_OUTPUT_LENGTH = 50_000; // 50KB max output
const MAX_CODE_LENGTH = 100_000; // 100KB max code input

@Injectable()
export class CodeSandboxService {
  private readonly logger = new Logger(CodeSandboxService.name);

  // In-memory rate limiter: userId -> array of timestamps
  private readonly rateLimitMap = new Map<string, number[]>();
  private readonly RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
  private readonly RATE_LIMIT_MAX = 10; // 10 executions per minute

  async executeCode(
    userId: string,
    language: string,
    code: string,
    stdin?: string,
  ): Promise<ExecutionResult> {
    // Validate language
    if (!SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)) {
      throw new BadRequestException(
        `Unsupported language: ${language}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`,
      );
    }

    // Validate code length
    if (!code || code.trim().length === 0) {
      throw new BadRequestException('Code cannot be empty');
    }
    if (code.length > MAX_CODE_LENGTH) {
      throw new BadRequestException(
        `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters`,
      );
    }

    // Strip potentially dangerous escape sequences
    code = this.sanitizeInput(code);

    // Check rate limit
    this.checkRateLimit(userId);

    this.logger.log(
      `Executing ${language} code for user ${userId} (${code.length} chars)`,
    );

    switch (language as SupportedLanguage) {
      case 'javascript':
        return this.executeJavaScript(code);
      case 'typescript':
        return this.executeTypeScript(code);
      case 'python':
        return this.executePython(code, stdin);
      default:
        throw new BadRequestException(`Unsupported language: ${language}`);
    }
  }

  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES.map((lang) => ({
      id: lang,
      name: lang.charAt(0).toUpperCase() + lang.slice(1),
      version: this.getLanguageVersion(lang),
    }));
  }

  // ============================================
  // JavaScript Execution (Node.js vm module)
  // ============================================

  private async executeJavaScript(code: string): Promise<ExecutionResult> {
    const stdoutLines: string[] = [];
    const stderrLines: string[] = [];
    const startTime = process.hrtime.bigint();
    let exitCode = 0;

    // Build a minimal sandbox with no access to fs, net, child_process, etc.
    const sandbox = {
      console: {
        log: (...args: any[]) => stdoutLines.push(args.map(String).join(' ')),
        error: (...args: any[]) =>
          stderrLines.push(args.map(String).join(' ')),
        warn: (...args: any[]) =>
          stderrLines.push(args.map(String).join(' ')),
        info: (...args: any[]) => stdoutLines.push(args.map(String).join(' ')),
      },
      setTimeout: undefined,
      setInterval: undefined,
      setImmediate: undefined,
      clearTimeout: undefined,
      clearInterval: undefined,
      clearImmediate: undefined,
      process: undefined,
      require: undefined,
      global: undefined,
      globalThis: undefined,
      // Safe globals
      Math,
      JSON,
      Date,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      encodeURIComponent,
      decodeURIComponent,
      encodeURI,
      decodeURI,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      Map,
      Set,
      WeakMap,
      WeakSet,
      Promise,
      Symbol,
      Error,
      TypeError,
      RangeError,
      SyntaxError,
      ReferenceError,
    };

    const context = vm.createContext(sandbox);

    try {
      const script = new vm.Script(code);
      const result = script.runInContext(context, { timeout: MAX_TIMEOUT_MS });

      // If the code returns a value and nothing was logged, show the return value
      if (stdoutLines.length === 0 && result !== undefined) {
        stdoutLines.push(String(result));
      }
    } catch (error: any) {
      exitCode = 1;
      if (error.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
        stderrLines.push(`Execution timed out (${MAX_TIMEOUT_MS / 1000}s limit)`);
      } else {
        stderrLines.push(error.message || String(error));
      }
    }

    const endTime = process.hrtime.bigint();
    const executionTimeMs = Number(endTime - startTime) / 1_000_000;
    const memoryUsageKb = Math.round(
      process.memoryUsage().heapUsed / 1024,
    );

    return {
      stdout: this.truncateOutput(stdoutLines.join('\n')),
      stderr: this.truncateOutput(stderrLines.join('\n')),
      exitCode,
      executionTimeMs: Math.round(executionTimeMs),
      memoryUsageKb,
    };
  }

  // ============================================
  // TypeScript Execution (transpile then run as JS)
  // ============================================

  private async executeTypeScript(code: string): Promise<ExecutionResult> {
    // Transpile TypeScript to JavaScript using a simple approach:
    // Strip type annotations using a regex-based approach for common patterns.
    // For full fidelity we'd use esbuild or tsc, but for v1 we do inline transpilation.
    try {
      const jsCode = this.transpileTypeScript(code);
      return this.executeJavaScript(jsCode);
    } catch (error: any) {
      return {
        stdout: '',
        stderr: `TypeScript compilation error: ${error.message}`,
        exitCode: 1,
        executionTimeMs: 0,
        memoryUsageKb: 0,
      };
    }
  }

  /**
   * Simple TypeScript-to-JavaScript transpiler.
   * Strips type annotations, interfaces, type aliases, and enums.
   * For v1 this handles common patterns. Does not handle all edge cases.
   */
  private transpileTypeScript(code: string): string {
    let js = code;

    // Remove interface declarations
    js = js.replace(/\binterface\s+\w+\s*(?:<[^>]*>)?\s*(?:extends\s+[^{]*)?\{[^}]*\}/gs, '');

    // Remove type alias declarations
    js = js.replace(/\btype\s+\w+\s*(?:<[^>]*>)?\s*=\s*[^;]+;/g, '');

    // Remove type assertions (as Type)
    js = js.replace(/\s+as\s+\w+(?:<[^>]*>)?/g, '');

    // Remove generic type parameters from function declarations
    js = js.replace(/(<\w+(?:\s*,\s*\w+)*>)\s*\(/g, '(');

    // Remove type annotations from variable declarations (let x: string = ...)
    js = js.replace(/:\s*\w+(?:<[^>]*>)?(?:\[\])?\s*(?==)/g, ' ');

    // Remove type annotations from function parameters (param: Type)
    js = js.replace(
      /(\w+)\s*:\s*\w+(?:<[^>]*>)?(?:\[\])?(?:\s*\|[^,)]+)?/g,
      '$1',
    );

    // Remove return type annotations
    js = js.replace(/\)\s*:\s*\w+(?:<[^>]*>)?(?:\[\])?\s*(?=[{=>])/g, ') ');

    // Remove enum declarations (replace with object)
    js = js.replace(/\benum\s+(\w+)\s*\{([^}]*)\}/g, (_, name, body) => {
      const entries = body
        .split(',')
        .map((e: string) => e.trim())
        .filter(Boolean)
        .map((e: string) => {
          const [key, val] = e.split('=').map((s: string) => s.trim());
          return val ? `${key}: ${val}` : `${key}: "${key}"`;
        });
      return `const ${name} = { ${entries.join(', ')} };`;
    });

    // Remove access modifiers
    js = js.replace(/\b(public|private|protected|readonly)\s+/g, '');

    // Remove 'declare' keyword
    js = js.replace(/\bdeclare\s+/g, '');

    return js;
  }

  // ============================================
  // Python Execution (child_process spawn)
  // ============================================

  private async executePython(
    code: string,
    stdin?: string,
  ): Promise<ExecutionResult> {
    const tmpDir = os.tmpdir();
    const fileName = `wants_sandbox_${crypto.randomBytes(8).toString('hex')}.py`;
    const filePath = path.join(tmpDir, fileName);

    try {
      // Write code to a temp file
      fs.writeFileSync(filePath, code, 'utf-8');

      return await new Promise<ExecutionResult>((resolve) => {
        const startTime = process.hrtime.bigint();
        const stdoutChunks: Buffer[] = [];
        const stderrChunks: Buffer[] = [];

        // Use timeout command on macOS/Linux for time limit
        const pythonProcess = spawn('python3', ['-u', filePath], {
          timeout: MAX_TIMEOUT_MS,
          env: {
            // Minimal environment -- no access to user env vars
            PATH: '/usr/local/bin:/usr/bin:/bin',
            HOME: tmpDir,
            PYTHONDONTWRITEBYTECODE: '1',
          },
          stdio: ['pipe', 'pipe', 'pipe'],
        });

        // Feed stdin if provided
        if (stdin) {
          pythonProcess.stdin.write(stdin);
        }
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data: Buffer) => {
          stdoutChunks.push(data);
        });

        pythonProcess.stderr.on('data', (data: Buffer) => {
          stderrChunks.push(data);
        });

        // Kill after timeout as a safety net
        const killTimer = setTimeout(() => {
          pythonProcess.kill('SIGKILL');
        }, MAX_TIMEOUT_MS + 1000);

        pythonProcess.on('close', (exitCode: number | null) => {
          clearTimeout(killTimer);
          const endTime = process.hrtime.bigint();
          const executionTimeMs = Number(endTime - startTime) / 1_000_000;

          resolve({
            stdout: this.truncateOutput(
              Buffer.concat(stdoutChunks).toString('utf-8'),
            ),
            stderr: this.truncateOutput(
              Buffer.concat(stderrChunks).toString('utf-8'),
            ),
            exitCode: exitCode ?? 1,
            executionTimeMs: Math.round(executionTimeMs),
            memoryUsageKb: 0, // Cannot easily measure child process memory
          });
        });

        pythonProcess.on('error', (err: Error) => {
          clearTimeout(killTimer);
          const endTime = process.hrtime.bigint();
          const executionTimeMs = Number(endTime - startTime) / 1_000_000;

          resolve({
            stdout: '',
            stderr: `Failed to execute Python: ${err.message}. Is python3 installed?`,
            exitCode: 1,
            executionTimeMs: Math.round(executionTimeMs),
            memoryUsageKb: 0,
          });
        });
      });
    } finally {
      // Clean up temp file
      try {
        fs.unlinkSync(filePath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  // ============================================
  // Rate Limiting
  // ============================================

  private checkRateLimit(userId: string): void {
    const now = Date.now();
    const windowStart = now - this.RATE_LIMIT_WINDOW_MS;

    // Get or create the timestamp array for this user
    let timestamps = this.rateLimitMap.get(userId) || [];

    // Remove timestamps outside the window
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length >= this.RATE_LIMIT_MAX) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Rate limit exceeded. Maximum ${this.RATE_LIMIT_MAX} executions per minute.`,
          retryAfterMs: timestamps[0] + this.RATE_LIMIT_WINDOW_MS - now,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    timestamps.push(now);
    this.rateLimitMap.set(userId, timestamps);

    // Periodically clean up old entries to prevent memory leak
    if (this.rateLimitMap.size > 10_000) {
      this.cleanupRateLimitMap();
    }
  }

  private cleanupRateLimitMap(): void {
    const now = Date.now();
    const windowStart = now - this.RATE_LIMIT_WINDOW_MS;

    for (const [userId, timestamps] of this.rateLimitMap.entries()) {
      const active = timestamps.filter((t) => t > windowStart);
      if (active.length === 0) {
        this.rateLimitMap.delete(userId);
      } else {
        this.rateLimitMap.set(userId, active);
      }
    }
  }

  // ============================================
  // Helpers
  // ============================================

  private sanitizeInput(code: string): string {
    // Strip ANSI escape sequences that could be used for terminal injection
    return code.replace(
      // eslint-disable-next-line no-control-regex
      /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]|\x1B\[[0-9;]*[a-zA-Z]/g,
      '',
    );
  }

  private truncateOutput(output: string): string {
    if (output.length > MAX_OUTPUT_LENGTH) {
      return (
        output.substring(0, MAX_OUTPUT_LENGTH) +
        `\n... (output truncated at ${MAX_OUTPUT_LENGTH} characters)`
      );
    }
    return output;
  }

  private getLanguageVersion(language: string): string {
    switch (language) {
      case 'javascript':
        return `Node.js ${process.version}`;
      case 'typescript':
        return `TypeScript (transpiled to JS, Node.js ${process.version})`;
      case 'python':
        return 'Python 3.x (system)';
      default:
        return 'unknown';
    }
  }
}
