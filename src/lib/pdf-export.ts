import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Program, Organization, Benefit, Benchmark } from '@/types/coaching';

export interface PDFExportOptions {
  title: string;
  subtitle?: string;
  includeLogo?: boolean;
  includeFootnotes?: boolean;
  sources?: string[];
  author?: string;
}

export interface DashboardData {
  programs: (Program & { organization: Organization })[];
  stats: {
    activePrograms: number;
    averageROI: number;
    totalInvestment: number;
    totalParticipants: number;
  };
}

export interface ComparisonData {
  programs: (Program & { organization: Organization })[];
  benefits: Record<string, Benefit[]>;
  calculations: Record<string, {
    roi: number;
    paybackPeriod: number;
    totalInvestment: number;
    totalBenefits: number;
  }>;
}

export class PDFExportService {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number;
  private pageWidth: number;
  private logoHeight: number = 20;

  constructor() {
    this.doc = new jsPDF();
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
  }

  private async loadLogo(): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = '/lovable-uploads/c6e5ebea-b93f-43ad-8bda-afbe23315d8e.png';
    });
  }

  private checkPageBreak(height: number = 10): void {
    if (this.currentY + height > this.pageHeight - 30) {
      this.doc.addPage();
      this.currentY = 20;
    }
  }

  private addHeader(title: string, subtitle?: string, includeLogo: boolean = true): void {
    // Professional letterhead with company branding
    if (includeLogo) {
      // Logo will be added asynchronously
      this.currentY += this.logoHeight + 5;
    }

    // Company name and branding
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(51, 65, 122); // Primary color equivalent
    this.doc.text('RESONANCE EXECUTIVE COACHING', 20, this.currentY);
    this.currentY += 8;
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Executive Leadership Development', 20, this.currentY);
    this.currentY += 12;

    // Contact information line
    this.doc.setFontSize(10);
    this.doc.text('daniel@resonanceexecutivecoaching.com | 408-518-1185 | resonanceexecutivecoaching.com', 20, this.currentY);
    this.currentY += 15;

    // Document classification
    this.doc.setFillColor(245, 245, 250);
    this.doc.rect(20, this.currentY - 3, this.pageWidth - 40, 12, 'F');
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(51, 65, 122);
    this.doc.text('CONFIDENTIAL ROI ANALYSIS BY RESONANCE EXECUTIVE COACHING', 25, this.currentY + 5);
    this.currentY += 18;

    // Title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, 20, this.currentY);
    this.currentY += 10;

    // Subtitle
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(subtitle, 20, this.currentY);
      this.currentY += 8;
    }

    // Generation timestamp
    this.doc.setFontSize(10);
    this.doc.setTextColor(150, 150, 150);
    const timestamp = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) + ' at ' + new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
    this.doc.text(`Generated on: ${timestamp}`, 20, this.currentY);
    this.currentY += 15;

    // Reset color for content
    this.doc.setTextColor(0, 0, 0);
  }

  private addSection(title: string): void {
    this.checkPageBreak(20);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, 20, this.currentY);
    this.currentY += 10;
  }

  private addText(text: string, fontSize: number = 12, isBold: boolean = false): void {
    this.checkPageBreak();
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = this.doc.splitTextToSize(text, this.pageWidth - 40);
    lines.forEach((line: string) => {
      this.checkPageBreak();
      this.doc.text(line, 20, this.currentY);
      this.currentY += fontSize * 0.5;
    });
    this.currentY += 5;
  }

  private addTable(headers: string[], rows: string[][]): void {
    this.checkPageBreak(30);
    
    const startY = this.currentY;
    const colWidth = (this.pageWidth - 40) / headers.length;
    
    // Headers
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(20, startY - 5, this.pageWidth - 40, 10, 'F');
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    headers.forEach((header, index) => {
      this.doc.text(header, 25 + (index * colWidth), startY);
    });
    
    this.currentY = startY + 10;
    
    // Rows
    this.doc.setFont('helvetica', 'normal');
    rows.forEach((row, rowIndex) => {
      this.checkPageBreak(8);
      
      if (rowIndex % 2 === 1) {
        this.doc.setFillColor(250, 250, 250);
        this.doc.rect(20, this.currentY - 5, this.pageWidth - 40, 8, 'F');
      }
      
      row.forEach((cell, cellIndex) => {
        this.doc.text(cell, 25 + (cellIndex * colWidth), this.currentY);
      });
      
      this.currentY += 8;
    });
    
    this.currentY += 5;
  }

  private addFootnotes(sources: string[]): void {
    // Go to bottom of last page
    const pageCount = this.doc.getNumberOfPages();
    this.doc.setPage(pageCount);
    this.currentY = this.pageHeight - 40;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Sources & References:', 20, this.currentY);
    this.currentY += 6;

    this.doc.setFont('helvetica', 'normal');
    sources.forEach((source, index) => {
      const text = `${index + 1}. ${source}`;
      const lines = this.doc.splitTextToSize(text, this.pageWidth - 40);
      lines.forEach((line: string) => {
        if (this.currentY > this.pageHeight - 20) {
          this.doc.addPage();
          this.currentY = 20;
        }
        this.doc.text(line, 20, this.currentY);
        this.currentY += 4;
      });
    });

    // Generated by footer
    this.currentY += 5;
    this.doc.setFontSize(8);
    this.doc.setTextColor(150, 150, 150);
    const timestamp = new Date().toLocaleString();
    this.doc.text(`Generated by Resonance Executive Coaching ROI Dashboard - ${timestamp}`, 20, this.currentY);
    this.currentY += 4;
    this.doc.text('https://resonanceexecutivecoaching.com/', 20, this.currentY);
    this.currentY += 4;
    this.doc.text('Contact: daniel@resonanceexecutivecoaching.com', 20, this.currentY);
  }

  async exportDashboard(data: DashboardData, options: PDFExportOptions): Promise<void> {
    try {
      // Load and add logo if requested
      if (options.includeLogo) {
        const logoData = await this.loadLogo();
        this.doc.addImage(logoData, 'PNG', 20, 10, 40, this.logoHeight);
      }

      this.addHeader(options.title, options.subtitle, options.includeLogo);

      // Executive Summary
      this.addSection('Executive Summary');
      this.addText(`This dashboard report summarizes ${data.stats.activePrograms} active coaching programs with a total investment of $${data.stats.totalInvestment.toLocaleString()}, serving ${data.stats.totalParticipants} participants.`);
      
      if (data.stats.averageROI > 0) {
        this.addText(`The average ROI across all programs is ${data.stats.averageROI.toFixed(1)}%.`);
      }

      // Program Overview
      if (data.programs.length > 0) {
        this.addSection('Program Overview');
        
        const headers = ['Program Name', 'Organization', 'Participants', 'Duration', 'Investment'];
        const rows = data.programs.map(program => [
          program.name,
          program.organization?.name || 'N/A',
          program.participants_count.toString(),
          `${program.duration_months} months`,
          `$${((program.cost_per_participant * program.participants_count) + program.overhead_costs).toLocaleString()}`
        ]);
        
        this.addTable(headers, rows);
      }

      // Add footnotes if requested
      if (options.includeFootnotes && options.sources) {
        this.addFootnotes(options.sources);
      }

      // Save the PDF
      this.doc.save(`${options.title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Error generating dashboard PDF:', error);
      throw error;
    }
  }

  async exportComparison(data: ComparisonData, options: PDFExportOptions): Promise<void> {
    try {
      // Load and add logo if requested
      if (options.includeLogo) {
        const logoData = await this.loadLogo();
        this.doc.addImage(logoData, 'PNG', 20, 10, 40, this.logoHeight);
      }

      this.addHeader(options.title, options.subtitle, options.includeLogo);

      // Comparison Summary
      this.addSection('Comparison Summary');
      this.addText(`This report compares ${data.programs.length} executive coaching programs across key performance and financial metrics.`);

      // Comparison Table
      this.addSection('Side-by-Side Comparison');
      
      const headers = ['Metric', ...data.programs.map(p => p.name)];
      const rows = [
        ['Organization', ...data.programs.map(p => p.organization?.name || 'N/A')],
        ['Duration', ...data.programs.map(p => `${p.duration_months} months`)],
        ['Participants', ...data.programs.map(p => p.participants_count.toString())],
        ['Cost per Participant', ...data.programs.map(p => `$${p.cost_per_participant.toLocaleString()}`)],
        ['Total Investment', ...data.programs.map(p => `$${data.calculations[p.id]?.totalInvestment.toLocaleString() || 'N/A'}`)],
        ['Expected ROI', ...data.programs.map(p => `${data.calculations[p.id]?.roi.toFixed(1) || '0.0'}%`)],
        ['Payback Period', ...data.programs.map(p => `${data.calculations[p.id]?.paybackPeriod.toFixed(1) || 'N/A'} years`)]
      ];
      
      this.addTable(headers, rows);

      // Program Details
      data.programs.forEach(program => {
        this.addSection(`${program.name} - Detailed Analysis`);
        
        const calculation = data.calculations[program.id];
        if (calculation) {
          this.addText(`Total Investment: $${calculation.totalInvestment.toLocaleString()}`, 12, true);
          this.addText(`Expected ROI: ${calculation.roi.toFixed(1)}%`, 12, true);
          this.addText(`Payback Period: ${calculation.paybackPeriod.toFixed(1)} years`, 12, true);
        }

        const programBenefits = data.benefits[program.id];
        if (programBenefits && programBenefits.length > 0) {
          this.addText('Key Benefits:', 12, true);
          programBenefits.forEach(benefit => {
            this.addText(`• ${benefit.description} (${benefit.category}): $${benefit.annual_value.toLocaleString()} annually with ${benefit.attribution_percentage}% attribution`);
          });
        }
      });

      // Add footnotes if requested
      if (options.includeFootnotes && options.sources) {
        this.addFootnotes(options.sources);
      }

      // Save the PDF
      this.doc.save(`${options.title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Error generating comparison PDF:', error);
      throw error;
    }
  }

  async exportBenchmarks(benchmarks: Benchmark[], options: PDFExportOptions): Promise<void> {
    try {
      // Load and add logo if requested
      if (options.includeLogo) {
        const logoData = await this.loadLogo();
        this.doc.addImage(logoData, 'PNG', 20, 10, 40, this.logoHeight);
      }

      this.addHeader(options.title, options.subtitle, options.includeLogo);

      // Introduction
      this.addSection('Industry Benchmarks Overview');
      this.addText('This report provides comprehensive industry benchmarks for executive coaching effectiveness and ROI based on leading research studies.');

      // Benchmark Details
      benchmarks.forEach(benchmark => {
        this.addSection(benchmark.label);
        
        this.addText(`Coaching Effectiveness: ${benchmark.data.coaching_effectiveness}%`, 12, true);
        this.addText(`ROI Range: ${benchmark.data.roi_range.min}% - ${benchmark.data.roi_range.max}%`, 12, true);
        this.addText(`Average Program Duration: ${benchmark.data.average_program_duration} months`, 12, true);
        this.addText(`Typical Cost per Participant: $${benchmark.data.typical_cost_per_participant.toLocaleString()}`, 12, true);

        if (benchmark.data.success_factors) {
          this.addText('Key Success Factors:', 12, true);
          benchmark.data.success_factors.forEach((factor: string) => {
            this.addText(`• ${factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
          });
        }
      });

      // Key Insights
      this.addSection('Key Insights');
      this.addText('ROI Range Analysis: Industry studies consistently show executive coaching ROI ranging from 200% to 850%, with most programs achieving 300-700% returns when properly implemented and measured.');
      this.addText('Program Duration Trends: Optimal coaching program duration averages 6-14 months, with longer programs (12+ months) showing higher effectiveness rates and better ROI sustainability.');
      this.addText('Critical Success Factors: Executive engagement, clear objectives, measurement frameworks, and organizational readiness consistently emerge as key factors determining program success across all studies.');

      // Add footnotes if requested
      if (options.includeFootnotes && options.sources) {
        this.addFootnotes(options.sources);
      }

      // Save the PDF
      this.doc.save(`${options.title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Error generating benchmarks PDF:', error);
      throw error;
    }
  }
}