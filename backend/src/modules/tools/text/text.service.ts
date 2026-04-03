import { Injectable, BadRequestException } from '@nestjs/common';
import Ajv from 'ajv';
import * as Papa from 'papaparse';
import * as yaml from 'js-yaml';
import { marked } from 'marked';
import {
  camelCase,
  snakeCase,
  pascalCase,
  kebabCase,
  constantCase,
} from 'change-case';
import {
  TextCase,
  JsonFormatDto,
  JsonToCsvDto,
  CsvToJsonDto,
  JsonToYamlDto,
  YamlToJsonDto,
  MarkdownPreviewDto,
  TextCaseConvertDto,
  TextCountDto,
  JsonFormatResponseDto,
  JsonToCsvResponseDto,
  CsvToJsonResponseDto,
  JsonToYamlResponseDto,
  YamlToJsonResponseDto,
  MarkdownPreviewResponseDto,
  TextCaseConvertResponseDto,
  TextCountResponseDto,
} from './dto/text.dto';

@Injectable()
export class TextService {
  private ajv = new Ajv();

  formatJson(dto: JsonFormatDto): JsonFormatResponseDto {
    try {
      const parsed = JSON.parse(dto.json);
      const indent = dto.indent ?? 2;
      return {
        formatted: JSON.stringify(parsed, null, indent),
        valid: true,
      };
    } catch (error) {
      return {
        formatted: dto.json,
        valid: false,
        error: error.message,
      };
    }
  }

  validateJson(json: string): { valid: boolean; error?: string } {
    try {
      JSON.parse(json);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  jsonToCsv(dto: JsonToCsvDto): JsonToCsvResponseDto {
    try {
      const data = JSON.parse(dto.json);
      if (!Array.isArray(data)) {
        throw new BadRequestException('JSON must be an array of objects');
      }

      const csv = Papa.unparse(data, {
        header: dto.includeHeaders ?? true,
        delimiter: dto.delimiter || ',',
      });

      return {
        csv,
        rowCount: data.length,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Invalid JSON: ${error.message}`);
    }
  }

  csvToJson(dto: CsvToJsonDto): CsvToJsonResponseDto {
    const result = Papa.parse(dto.csv, {
      header: dto.hasHeaders ?? true,
      delimiter: dto.delimiter || ',',
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      throw new BadRequestException(
        `CSV parsing errors: ${result.errors.map((e) => e.message).join(', ')}`,
      );
    }

    return {
      json: result.data as any[],
      rowCount: result.data.length,
    };
  }

  jsonToYaml(dto: JsonToYamlDto): JsonToYamlResponseDto {
    try {
      const data = JSON.parse(dto.json);
      const yamlStr = yaml.dump(data, {
        indent: dto.indent || 2,
        lineWidth: -1,
        noRefs: true,
      });

      return { yaml: yamlStr };
    } catch (error) {
      throw new BadRequestException(`Invalid JSON: ${error.message}`);
    }
  }

  yamlToJson(dto: YamlToJsonDto): YamlToJsonResponseDto {
    try {
      const data = yaml.load(dto.yaml);
      return { json: data };
    } catch (error) {
      throw new BadRequestException(`Invalid YAML: ${error.message}`);
    }
  }

  markdownPreview(dto: MarkdownPreviewDto): MarkdownPreviewResponseDto {
    const options = {
      gfm: dto.gfm ?? true,
    };

    const html = marked.parse(dto.markdown, options);

    return { html: html as string };
  }

  convertTextCase(dto: TextCaseConvertDto): TextCaseConvertResponseDto {
    let converted: string;

    switch (dto.targetCase) {
      case TextCase.CAMEL:
        converted = camelCase(dto.text);
        break;
      case TextCase.SNAKE:
        converted = snakeCase(dto.text);
        break;
      case TextCase.PASCAL:
        converted = pascalCase(dto.text);
        break;
      case TextCase.KEBAB:
        converted = kebabCase(dto.text);
        break;
      case TextCase.CONSTANT:
        converted = constantCase(dto.text);
        break;
      case TextCase.UPPER:
        converted = dto.text.toUpperCase();
        break;
      case TextCase.LOWER:
        converted = dto.text.toLowerCase();
        break;
      case TextCase.TITLE:
        converted = this.toTitleCase(dto.text);
        break;
      case TextCase.SENTENCE:
        converted = this.toSentenceCase(dto.text);
        break;
      default:
        converted = dto.text;
    }

    return {
      original: dto.text,
      converted,
      targetCase: dto.targetCase,
    };
  }

  countText(dto: TextCountDto): TextCountResponseDto {
    const text = dto.text;

    // Characters (including spaces)
    const characters = text.length;

    // Characters (excluding spaces)
    const charactersNoSpaces = text.replace(/\s/g, '').length;

    // Words (split by whitespace, filter empty)
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;

    // Sentences (split by . ! ? followed by space or end)
    const sentences = text
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0).length;

    // Paragraphs (split by multiple newlines)
    const paragraphs = text
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 0).length;

    // Lines
    const lines = text.split('\n').length;

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
    };
  }

  private toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private toSentenceCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
