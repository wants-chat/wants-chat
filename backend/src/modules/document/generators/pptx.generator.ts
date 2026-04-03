import { Injectable, Logger } from '@nestjs/common';
import PptxGenJS from 'pptxgenjs';
import axios from 'axios';
import { SlideDto, PptxOptions, PptxTheme } from '../dto/document.dto';

interface SlideLayout {
  name: string;
  placeholders: {
    title?: { x: number; y: number; w: number; h: number };
    subtitle?: { x: number; y: number; w: number; h: number };
    body?: { x: number; y: number; w: number; h: number };
    image?: { x: number; y: number; w: number; h: number };
  };
}

@Injectable()
export class PptxGenerator {
  private readonly logger = new Logger(PptxGenerator.name);

  // Default theme colors
  private readonly defaultTheme: PptxTheme = {
    primaryColor: '2563EB', // Blue
    secondaryColor: '1E40AF', // Dark blue
    backgroundColor: 'FFFFFF', // White
    titleFont: 'Arial',
    bodyFont: 'Arial',
  };

  // Predefined layouts
  private readonly layouts: Record<string, SlideLayout> = {
    title: {
      name: 'Title Slide',
      placeholders: {
        title: { x: 0.5, y: 2.5, w: 9, h: 1.5 },
        subtitle: { x: 0.5, y: 4.2, w: 9, h: 1 },
      },
    },
    titleAndContent: {
      name: 'Title and Content',
      placeholders: {
        title: { x: 0.5, y: 0.3, w: 9, h: 1 },
        body: { x: 0.5, y: 1.5, w: 9, h: 5.5 },
      },
    },
    sectionHeader: {
      name: 'Section Header',
      placeholders: {
        title: { x: 0.5, y: 3, w: 9, h: 1.5 },
      },
    },
    twoColumn: {
      name: 'Two Column',
      placeholders: {
        title: { x: 0.5, y: 0.3, w: 9, h: 1 },
        body: { x: 0.5, y: 1.5, w: 4.2, h: 5.5 },
      },
    },
    blank: {
      name: 'Blank',
      placeholders: {},
    },
    imageOnly: {
      name: 'Image Only',
      placeholders: {
        title: { x: 0.5, y: 0.3, w: 9, h: 0.8 },
        image: { x: 0.5, y: 1.3, w: 9, h: 5.7 },
      },
    },
  };

  /**
   * Generate PowerPoint presentation from slides
   */
  async generatePresentation(
    slides: SlideDto[],
    options: PptxOptions = {},
  ): Promise<Buffer> {
    const pptx = new PptxGenJS();

    // Apply theme and metadata
    this.applyPresentationSettings(pptx, options);

    // Generate each slide
    for (const slideDto of slides) {
      await this.addSlide(pptx, slideDto, options.theme || this.defaultTheme);
    }

    // Generate buffer
    const data = await pptx.write({ outputType: 'nodebuffer' });
    return data as Buffer;
  }

  /**
   * Apply presentation settings and metadata
   */
  private applyPresentationSettings(pptx: PptxGenJS, options: PptxOptions): void {
    // Set presentation metadata
    if (options.title) pptx.title = options.title;
    if (options.author) pptx.author = options.author;
    if (options.company) pptx.company = options.company;
    if (options.subject) pptx.subject = options.subject;

    // Set slide dimensions (default: 10 x 7.5 inches for standard 4:3)
    pptx.defineLayout({
      name: 'CUSTOM',
      width: options.slideWidth || 10,
      height: options.slideHeight || 7.5,
    });
    pptx.layout = 'CUSTOM';
  }

  /**
   * Add a single slide to the presentation
   */
  private async addSlide(
    pptx: PptxGenJS,
    slideDto: SlideDto,
    theme: PptxTheme,
  ): Promise<void> {
    const slide = pptx.addSlide();
    const layout = this.layouts[slideDto.layout || 'titleAndContent'];
    const mergedTheme = { ...this.defaultTheme, ...theme };

    // Apply background
    if (slideDto.backgroundColor) {
      slide.background = { color: slideDto.backgroundColor.replace('#', '') };
    } else if (mergedTheme.backgroundColor) {
      slide.background = { color: mergedTheme.backgroundColor.replace('#', '') };
    }

    // Add title
    if (slideDto.title && layout.placeholders.title) {
      const titlePos = layout.placeholders.title;
      slide.addText(slideDto.title, {
        x: titlePos.x,
        y: titlePos.y,
        w: titlePos.w,
        h: titlePos.h,
        fontSize: this.getTitleFontSize(slideDto.layout),
        fontFace: mergedTheme.titleFont || 'Arial',
        bold: true,
        color: mergedTheme.primaryColor?.replace('#', '') || '000000',
        align: slideDto.layout === 'title' || slideDto.layout === 'sectionHeader' ? 'center' : 'left',
        valign: 'middle',
      });
    }

    // Add subtitle (for title slides)
    if (slideDto.subtitle && layout.placeholders.subtitle) {
      const subtitlePos = layout.placeholders.subtitle;
      slide.addText(slideDto.subtitle, {
        x: subtitlePos.x,
        y: subtitlePos.y,
        w: subtitlePos.w,
        h: subtitlePos.h,
        fontSize: 20,
        fontFace: mergedTheme.bodyFont || 'Arial',
        color: mergedTheme.secondaryColor?.replace('#', '') || '666666',
        align: 'center',
        valign: 'top',
      });
    }

    // Add body content
    if (slideDto.content && layout.placeholders.body) {
      await this.addBodyContent(slide, slideDto.content, layout.placeholders.body, mergedTheme);
    }

    // Add image if specified
    if (slideDto.content?.image) {
      await this.addImage(slide, slideDto.content, layout.placeholders.image);
    }

    // Add speaker notes
    if (slideDto.content?.notes) {
      slide.addNotes(slideDto.content.notes);
    }
  }

  /**
   * Add body content (text or bullets)
   */
  private async addBodyContent(
    slide: any,
    content: SlideDto['content'],
    position: { x: number; y: number; w: number; h: number },
    theme: PptxTheme,
  ): Promise<void> {
    if (!content) return;

    // Add bullet points
    if (content.bullets && content.bullets.length > 0) {
      const bulletText: PptxGenJS.TextProps[] = content.bullets.map((bullet, index) => ({
        text: bullet,
        options: {
          bullet: true,
          fontSize: 18,
          fontFace: theme.bodyFont || 'Arial',
          color: '333333',
          breakLine: index < content.bullets!.length - 1,
          indentLevel: 0,
        },
      }));

      slide.addText(bulletText, {
        x: position.x,
        y: position.y,
        w: position.w,
        h: position.h,
        valign: 'top',
      });
    }
    // Add plain text
    else if (content.text) {
      slide.addText(content.text, {
        x: position.x,
        y: position.y,
        w: position.w,
        h: position.h,
        fontSize: 18,
        fontFace: theme.bodyFont || 'Arial',
        color: '333333',
        valign: 'top',
        align: 'left',
      });
    }
  }

  /**
   * Add image to slide
   */
  private async addImage(
    slide: any,
    content: SlideDto['content'],
    defaultPosition?: { x: number; y: number; w: number; h: number },
  ): Promise<void> {
    if (!content?.image) return;

    try {
      let imageData: string | { path: string };
      const position = content.imagePosition || defaultPosition || { x: 0.5, y: 1.5, w: 9, h: 5.5 };

      // Check if it's a URL or base64
      if (content.image.startsWith('http://') || content.image.startsWith('https://')) {
        // Fetch image from URL
        const response = await axios.get(content.image, { responseType: 'arraybuffer' });
        const base64 = Buffer.from(response.data).toString('base64');
        const mimeType = response.headers['content-type'] || 'image/png';
        imageData = `data:${mimeType};base64,${base64}`;
      } else if (content.image.startsWith('data:')) {
        // Already base64 with data URI
        imageData = content.image;
      } else {
        // Assume it's a file path
        imageData = { path: content.image };
      }

      // Normalize position values
      const w = (position as any).width || (position as any).w || 9;
      const h = (position as any).height || (position as any).h || 5.5;

      slide.addImage({
        data: typeof imageData === 'string' ? imageData : undefined,
        path: typeof imageData === 'object' ? imageData.path : undefined,
        x: position.x,
        y: position.y,
        w,
        h,
        sizing: { type: 'contain', w, h },
      });
    } catch (error) {
      this.logger.warn(`Failed to add image to slide: ${error.message}`);
    }
  }

  /**
   * Get title font size based on layout
   */
  private getTitleFontSize(layout?: string): number {
    const sizes: Record<string, number> = {
      title: 44,
      sectionHeader: 36,
      titleAndContent: 32,
      twoColumn: 32,
      blank: 32,
      imageOnly: 28,
    };
    return sizes[layout || 'titleAndContent'] || 32;
  }

  /**
   * Generate presentation from markdown content
   * Parses markdown into slides automatically
   */
  async generateFromMarkdown(
    markdownContent: string,
    options: PptxOptions = {},
  ): Promise<Buffer> {
    const slides = this.parseMarkdownToSlides(markdownContent);
    return this.generatePresentation(slides, options);
  }

  /**
   * Parse markdown into slides
   * Uses horizontal rules (---) as slide separators
   * First heading becomes title, subsequent content becomes bullets
   */
  private parseMarkdownToSlides(markdown: string): SlideDto[] {
    const slides: SlideDto[] = [];
    const slideTexts = markdown.split(/\n---+\n/);

    for (let i = 0; i < slideTexts.length; i++) {
      const slideText = slideTexts[i].trim();
      if (!slideText) continue;

      const slide = this.parseSlideContent(slideText, i === 0);
      slides.push(slide);
    }

    return slides;
  }

  /**
   * Parse single slide content from markdown
   */
  private parseSlideContent(text: string, isFirstSlide: boolean): SlideDto {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    let title = '';
    let subtitle = '';
    const bullets: string[] = [];
    let bodyText = '';

    for (const line of lines) {
      // Check for headings
      if (line.startsWith('# ')) {
        title = line.replace(/^#\s+/, '');
      } else if (line.startsWith('## ')) {
        if (!title) {
          title = line.replace(/^##\s+/, '');
        } else {
          subtitle = line.replace(/^##\s+/, '');
        }
      } else if (line.startsWith('### ')) {
        subtitle = line.replace(/^###\s+/, '');
      }
      // Check for bullet points
      else if (line.match(/^[-*+]\s/)) {
        bullets.push(line.replace(/^[-*+]\s+/, ''));
      }
      // Check for numbered lists
      else if (line.match(/^\d+\.\s/)) {
        bullets.push(line.replace(/^\d+\.\s+/, ''));
      }
      // Regular text
      else if (line) {
        if (!title) {
          title = line;
        } else if (!subtitle && isFirstSlide) {
          subtitle = line;
        } else {
          bodyText += (bodyText ? '\n' : '') + line;
        }
      }
    }

    // Determine layout
    let layout: SlideDto['layout'] = 'titleAndContent';
    if (isFirstSlide && subtitle) {
      layout = 'title';
    } else if (!bullets.length && !bodyText) {
      layout = 'sectionHeader';
    }

    return {
      title: title || 'Untitled Slide',
      subtitle,
      layout,
      content: {
        bullets: bullets.length > 0 ? bullets : undefined,
        text: bodyText || undefined,
      },
    };
  }

  /**
   * Add a chart to a slide
   */
  addChart(
    slide: any,
    type: 'bar' | 'line' | 'pie' | 'doughnut',
    data: { labels: string[]; values: number[] },
    options: { x?: number; y?: number; w?: number; h?: number; title?: string } = {},
  ): void {
    const chartData = [
      {
        name: options.title || 'Data',
        labels: data.labels,
        values: data.values,
      },
    ];

    const chartType = {
      bar: 'bar' as const,
      line: 'line' as const,
      pie: 'pie' as const,
      doughnut: 'doughnut' as const,
    }[type];

    slide.addChart(chartType, chartData, {
      x: options.x || 0.5,
      y: options.y || 1.5,
      w: options.w || 9,
      h: options.h || 5.5,
      showTitle: !!options.title,
      title: options.title,
      showLegend: true,
      legendPos: 'r',
    });
  }

  /**
   * Add a table to a slide
   */
  addTable(
    slide: any,
    rows: string[][],
    options: { x?: number; y?: number; w?: number; h?: number; headerRow?: boolean } = {},
  ): void {
    if (rows.length === 0) return;

    const tableRows: PptxGenJS.TableRow[] = rows.map((row, rowIndex) => {
      return row.map((cell) => ({
        text: cell,
        options: {
          bold: options.headerRow && rowIndex === 0,
          fill: options.headerRow && rowIndex === 0 ? { color: 'E0E0E0' } : undefined,
          border: { pt: 0.5, color: 'CCCCCC' },
          fontSize: 12,
        },
      }));
    });

    slide.addTable(tableRows, {
      x: options.x || 0.5,
      y: options.y || 1.5,
      w: options.w || 9,
      colW: Array(rows[0].length).fill((options.w || 9) / rows[0].length),
      border: { pt: 0.5, color: 'CCCCCC' },
      autoPage: true,
    });
  }
}
