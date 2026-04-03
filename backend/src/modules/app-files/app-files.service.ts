import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const archiver = require('archiver');

export interface FileTreeItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  children?: FileTreeItem[];
}

@Injectable()
export class AppFilesService {
  private readonly logger = new Logger(AppFilesService.name);
  private readonly appsBasePath: string;

  constructor() {
    // Apps are located in the app-builder/generated folder
    this.appsBasePath = path.join(process.cwd(), '..', 'app-builder', 'generated');
    this.logger.log(`Apps base path: ${this.appsBasePath}`);
  }

  /**
   * Get the file tree for an app's frontend, backend, or mobile
   */
  async getFileTree(appId: string, type: 'frontend' | 'backend' | 'mobile'): Promise<FileTreeItem[]> {
    const appPath = path.join(this.appsBasePath, appId, type, 'src');
    this.logger.log(`Getting file tree for: ${appPath}`);
    this.logger.log(`Base path: ${this.appsBasePath}`);
    this.logger.log(`CWD: ${process.cwd()}`);

    if (!(await fs.pathExists(appPath))) {
      this.logger.warn(`Path not found: ${appPath}`);
      // Try to list what exists
      const appDir = path.join(this.appsBasePath, appId);
      if (await fs.pathExists(appDir)) {
        const contents = await fs.readdir(appDir);
        this.logger.log(`App dir ${appDir} contains: ${contents.join(', ')}`);
      } else {
        this.logger.warn(`App dir not found: ${appDir}`);
      }
      return [];
    }

    this.logger.log(`Path exists, building file tree...`);

    const skipItems = new Set([
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      'coverage',
      '.cache',
      '.vscode',
      '.idea',
      '.wrangler',
    ]);

    const buildFileTree = async (
      dirPath: string,
      relativePath: string = '',
    ): Promise<FileTreeItem[]> => {
      const items = await fs.readdir(dirPath);
      const result: FileTreeItem[] = [];

      for (const item of items) {
        if (skipItems.has(item) || item.startsWith('.')) {
          continue;
        }

        const fullPath = path.join(dirPath, item);
        const itemRelativePath = relativePath ? `${relativePath}/${item}` : item;

        try {
          const stat = await fs.stat(fullPath);

          if (stat.isDirectory()) {
            result.push({
              name: item,
              type: 'folder',
              path: itemRelativePath,
              children: await buildFileTree(fullPath, itemRelativePath),
            });
          } else {
            // Only include source code files
            const ext = path.extname(item).toLowerCase();
            const codeExtensions = [
              '.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss',
              '.html', '.md', '.sql', '.yaml', '.yml', '.env.example'
            ];

            if (codeExtensions.includes(ext) || item === '.env.example') {
              result.push({
                name: item,
                type: 'file',
                path: itemRelativePath,
                size: stat.size,
              });
            }
          }
        } catch (error) {
          this.logger.warn(`Failed to stat ${fullPath}: ${error.message}`);
          continue;
        }
      }

      // Sort: folders first, then files, both alphabetically
      return result.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    };

    const result = await buildFileTree(appPath);
    this.logger.log(`File tree built with ${result.length} items`);
    return result;
  }

  /**
   * Get the content of a specific file
   */
  async getFileContent(
    appId: string,
    type: 'frontend' | 'backend' | 'mobile',
    filePath: string,
  ): Promise<{ content: string; path: string; language: string }> {
    // Sanitize the file path to prevent directory traversal
    const sanitizedPath = filePath.replace(/\.\./g, '').replace(/^\//, '');
    const fullPath = path.join(this.appsBasePath, appId, type, 'src', sanitizedPath);

    // Verify the path is within the expected directory
    const normalizedPath = path.normalize(fullPath);
    const expectedBase = path.normalize(path.join(this.appsBasePath, appId, type, 'src'));

    if (!normalizedPath.startsWith(expectedBase)) {
      this.logger.warn(`Path traversal attempt detected: ${filePath}`);
      throw new HttpException('Invalid file path', HttpStatus.BAD_REQUEST);
    }

    if (!(await fs.pathExists(fullPath))) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    const content = await fs.readFile(fullPath, 'utf-8');
    const language = this.getLanguageFromPath(filePath);

    return { content, path: sanitizedPath, language };
  }

  /**
   * Determine the language from file extension for syntax highlighting
   */
  private getLanguageFromPath(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.ts': 'typescript',
      '.tsx': 'tsx',
      '.js': 'javascript',
      '.jsx': 'jsx',
      '.json': 'json',
      '.css': 'css',
      '.scss': 'scss',
      '.html': 'html',
      '.md': 'markdown',
      '.sql': 'sql',
      '.yaml': 'yaml',
      '.yml': 'yaml',
    };
    return languageMap[ext] || 'text';
  }

  /**
   * Check if an app exists
   */
  async appExists(appId: string): Promise<boolean> {
    const appPath = path.join(this.appsBasePath, appId);
    return await fs.pathExists(appPath);
  }

  /**
   * Get app info (what types of code are available)
   */
  async getAppInfo(appId: string): Promise<{ hasFrontend: boolean; hasBackend: boolean; hasMobile: boolean }> {
    const frontendPath = path.join(this.appsBasePath, appId, 'frontend', 'src');
    const backendPath = path.join(this.appsBasePath, appId, 'backend', 'src');
    const mobilePath = path.join(this.appsBasePath, appId, 'mobile', 'src');

    return {
      hasFrontend: await fs.pathExists(frontendPath),
      hasBackend: await fs.pathExists(backendPath),
      hasMobile: await fs.pathExists(mobilePath),
    };
  }

  /**
   * Get the README.md content for an app
   */
  async getReadme(appId: string): Promise<{ content: string; exists: boolean }> {
    const readmePath = path.join(this.appsBasePath, appId, 'README.md');
    this.logger.log(`Looking for README at: ${readmePath}`);

    if (!(await fs.pathExists(readmePath))) {
      this.logger.warn(`README not found: ${readmePath}`);
      return { content: '', exists: false };
    }

    const content = await fs.readFile(readmePath, 'utf-8');
    return { content, exists: true };
  }

  /**
   * Create a ZIP archive of the app code
   */
  async createZipArchive(appId: string): Promise<Buffer> {
    const appPath = path.join(this.appsBasePath, appId);
    this.logger.log(`Creating ZIP archive for: ${appPath}`);

    if (!(await fs.pathExists(appPath))) {
      throw new HttpException('App not found', HttpStatus.NOT_FOUND);
    }

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', (err) => reject(err));

      // Items to exclude from archive
      const skipItems = [
        'node_modules',
        '.git',
        'dist',
        'build',
        '.next',
        'coverage',
        '.cache',
        '.wrangler',
        '.vscode',
        '.idea',
      ];

      // Add each type folder if it exists
      const types = ['frontend', 'backend', 'mobile'] as const;

      for (const type of types) {
        const typePath = path.join(appPath, type);
        if (fs.pathExistsSync(typePath)) {
          archive.directory(typePath, type, (entry) => {
            // Skip excluded directories
            for (const skip of skipItems) {
              if (entry.name.includes(`/${skip}/`) || entry.name.startsWith(`${skip}/`)) {
                return false;
              }
            }
            return entry;
          });
        }
      }

      // Add README.md if it exists
      const readmePath = path.join(appPath, 'README.md');
      if (fs.pathExistsSync(readmePath)) {
        archive.file(readmePath, { name: 'README.md' });
      }

      archive.finalize();
    });
  }

  /**
   * Update the content of a specific file
   */
  async updateFileContent(
    appId: string,
    type: 'frontend' | 'backend' | 'mobile',
    filePath: string,
    content: string,
  ): Promise<{ success: boolean; path: string }> {
    // Sanitize the file path to prevent directory traversal
    const sanitizedPath = filePath.replace(/\.\./g, '').replace(/^\//, '');
    const fullPath = path.join(this.appsBasePath, appId, type, 'src', sanitizedPath);

    // Verify the path is within the expected directory
    const normalizedPath = path.normalize(fullPath);
    const expectedBase = path.normalize(path.join(this.appsBasePath, appId, type, 'src'));

    if (!normalizedPath.startsWith(expectedBase)) {
      this.logger.warn(`Path traversal attempt detected: ${filePath}`);
      throw new HttpException('Invalid file path', HttpStatus.BAD_REQUEST);
    }

    // Ensure the directory exists
    await fs.ensureDir(path.dirname(fullPath));

    // Write the file
    await fs.writeFile(fullPath, content, 'utf-8');
    this.logger.log(`Updated file: ${fullPath}`);

    return { success: true, path: sanitizedPath };
  }
}
