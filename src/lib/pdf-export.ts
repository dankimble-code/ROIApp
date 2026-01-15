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

export interface ProgramROIData {
  roi: number;
  npv: number;
  paybackPeriod: number;
  totalInvestment: number;
  totalBenefits: number;
  netBenefit: number;
  yearlyBreakdown?: Array<{
    year: number;
    benefits: number;
    costs: number;
    cumulative: number;
  }>;
}

export interface DashboardData {
  programs: (Program & { organization: Organization })[];
  benefits: Record<string, Benefit[]>;
  roiCalculations: Record<string, ProgramROIData>;
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
      img.src = '/resonance-logo.png';
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

      // Portfolio ROI Summary Table
      const programsWithROI = data.programs.filter(p => data.roiCalculations[p.id]);
      if (programsWithROI.length > 0) {
        this.addSection('Portfolio ROI Summary');
        
        const roiHeaders = ['Program', 'ROI', 'NPV', 'Net Benefit', 'Payback'];
        const roiRows = programsWithROI.map(program => {
          const calc = data.roiCalculations[program.id];
          return [
            program.name.length > 20 ? program.name.substring(0, 18) + '...' : program.name,
            `${calc.roi.toFixed(1)}%`,
            `$${calc.npv.toLocaleString()}`,
            `$${calc.netBenefit.toLocaleString()}`,
            `${calc.paybackPeriod.toFixed(1)} yrs`
          ];
        });
        
        this.addTable(roiHeaders, roiRows);
      }

      // Program Overview Table
      if (data.programs.length > 0) {
        this.addSection('Program Overview');
        
        const headers = ['Program Name', 'Organization', 'Participants', 'Duration', 'Investment'];
        const rows = data.programs.map(program => [
          program.name.length > 15 ? program.name.substring(0, 13) + '...' : program.name,
          (program.organization?.name || 'N/A').length > 12 ? (program.organization?.name || 'N/A').substring(0, 10) + '...' : (program.organization?.name || 'N/A'),
          program.participants_count.toString(),
          `${program.duration_months} mo`,
          `$${((program.cost_per_participant * program.participants_count) + (program.overhead_costs || 0)).toLocaleString()}`
        ]);
        
        this.addTable(headers, rows);
      }

      // Detailed Program Analysis (one section per program)
      data.programs.forEach(program => {
        const roiCalc = data.roiCalculations[program.id];
        const programBenefits = data.benefits[program.id] || [];
        
        this.checkPageBreak(60);
        this.addSection(`${program.name}`);
        
        // Organization & Program Info
        this.addText(`Organization: ${program.organization?.name || 'N/A'}`, 11, true);
        this.addText(`Duration: ${program.duration_months} months | Participants: ${program.participants_count}`, 10);
        
        // Investment Breakdown
        const participantCost = program.cost_per_participant * program.participants_count;
        const overheadCost = program.overhead_costs || 0;
        const totalInvestment = participantCost + overheadCost;
        
        this.addText('Investment Breakdown:', 11, true);
        this.addText(`• Participant Costs: $${participantCost.toLocaleString()} ($${program.cost_per_participant.toLocaleString()} × ${program.participants_count})`, 10);
        if (overheadCost > 0) {
          this.addText(`• Overhead Costs: $${overheadCost.toLocaleString()}`, 10);
        }
        this.addText(`• Total Investment: $${totalInvestment.toLocaleString()}`, 10, true);

        // ROI Metrics
        if (roiCalc) {
          this.currentY += 3;
          this.addText('ROI Analysis (5-Year Projection):', 11, true);
          this.addText(`• Expected ROI (5-Year): ${roiCalc.roi.toFixed(1)}%`, 10);
          this.addText(`• Net Present Value (NPV): $${roiCalc.npv.toLocaleString()}`, 10);
          this.addText(`• Net Benefit: $${roiCalc.netBenefit.toLocaleString()}`, 10);
          this.addText(`• Payback Period: ${roiCalc.paybackPeriod.toFixed(1)} years`, 10);
          this.addText(`• Total Benefits (5-Year): $${roiCalc.totalBenefits.toLocaleString()}`, 10);
          this.addText(`• Benefit Multiple: ${(roiCalc.totalBenefits / roiCalc.totalInvestment).toFixed(2)}x`, 10);

          // 5-Year Benefits Projection - Always show full 5 years
          this.currentY += 3;
          this.addText('5-Year Benefits Projection:', 11, true);
          const yearHeaders = ['Year', 'Annual Benefits', 'Cumulative Benefits', 'Net Value'];
          
          // Generate 5-year projection data
          const annualBenefit = roiCalc.totalBenefits / 5; // Assuming 5-year total benefits
          const yearRows = [];
          let cumulativeBenefits = 0;
          for (let year = 1; year <= 5; year++) {
            cumulativeBenefits += annualBenefit;
            const netValue = cumulativeBenefits - roiCalc.totalInvestment;
            yearRows.push([
              `Year ${year}`,
              `$${Math.round(annualBenefit).toLocaleString()}`,
              `$${Math.round(cumulativeBenefits).toLocaleString()}`,
              `$${Math.round(netValue).toLocaleString()}`
            ]);
          }
          this.addTable(yearHeaders, yearRows);
        } else {
          this.addText('ROI Analysis: Not available - add benefits to calculate ROI', 10);
        }

        // Benefits Breakdown - Table style like app display
        if (programBenefits.length > 0) {
          this.currentY += 3;
          this.addText(`Key Benefits (${programBenefits.length} defined):`, 11, true);
          
          // Table headers for benefits
          const benefitHeaders = ['Category', 'Total Value', 'Attribution', 'Expected Impact'];
          const benefitRows = programBenefits.map(benefit => {
            const totalValue = benefit.annual_value * (program.participants_count || 1);
            const attributionValue = totalValue * (benefit.attribution_percentage / 100);
            const expectedImpact = attributionValue * (benefit.confidence_level / 100);
            return [
              benefit.category,
              `$${totalValue.toLocaleString()}`,
              `$${attributionValue.toLocaleString()} (${benefit.attribution_percentage}%)`,
              `$${expectedImpact.toLocaleString()} (${benefit.confidence_level}% conf)`
            ];
          });
          
          this.addTable(benefitHeaders, benefitRows);

          // Total benefits summary
          const totalAnnualValue = programBenefits.reduce((sum, b) => sum + b.annual_value * (program.participants_count || 1), 0);
          const totalExpectedImpact = programBenefits.reduce((sum, b) => {
            const totalValue = b.annual_value * (program.participants_count || 1);
            const attributionValue = totalValue * (b.attribution_percentage / 100);
            return sum + (attributionValue * (b.confidence_level / 100));
          }, 0);
          this.currentY += 2;
          this.addText(`Total Annual Value: $${totalAnnualValue.toLocaleString()} | Total Expected Impact: $${totalExpectedImpact.toLocaleString()}`, 10, true);
        } else {
          this.addText('Benefits: None defined - add benefits to enable ROI calculation', 10);
        }

        this.currentY += 5;
      });

      // Key Insights Section
      this.checkPageBreak(40);
      this.addSection('Key Insights');
      
      const totalBenefits = Object.values(data.roiCalculations).reduce((sum, calc) => sum + calc.totalBenefits, 0);
      const avgPayback = programsWithROI.length > 0 
        ? Object.values(data.roiCalculations).reduce((sum, calc) => sum + calc.paybackPeriod, 0) / programsWithROI.length 
        : 0;
      
      this.addText(`Portfolio Performance: ${programsWithROI.length} of ${data.programs.length} programs have calculated ROI metrics.`);
      if (totalBenefits > 0) {
        this.addText(`Total Expected Benefits: $${totalBenefits.toLocaleString()} across all programs.`);
      }
      if (avgPayback > 0) {
        this.addText(`Average Payback Period: ${avgPayback.toFixed(1)} years.`);
      }

      // Add footnotes if requested
      if (options.includeFootnotes && options.sources) {
        this.addFootnotes(options.sources);
      }

      // Save the PDF with "Resonance" prefix
      this.doc.save(`resonance_${options.title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
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
        ['Expected ROI (5-Year)', ...data.programs.map(p => `${data.calculations[p.id]?.roi.toFixed(1) || '0.0'}%`)],
        ['Payback Period', ...data.programs.map(p => `${data.calculations[p.id]?.paybackPeriod.toFixed(1) || 'N/A'} years`)]
      ];
      
      this.addTable(headers, rows);

      // Program Details
      data.programs.forEach(program => {
        this.addSection(`${program.name} - Detailed Analysis`);
        
        const calculation = data.calculations[program.id];
        if (calculation) {
          this.addText(`Total Investment: $${calculation.totalInvestment.toLocaleString()}`, 12, true);
          this.addText(`Expected ROI (5-Year): ${calculation.roi.toFixed(1)}%`, 12, true);
          this.addText(`Payback Period: ${calculation.paybackPeriod.toFixed(1)} years`, 12, true);
        }

        const programBenefits = data.benefits[program.id];
        if (programBenefits && programBenefits.length > 0) {
          this.addText('Key Benefits:', 12, true);
          
          // Table headers for benefits
          const benefitHeaders = ['Category', 'Total Value', 'Attribution', 'Expected Impact'];
          const benefitRows = programBenefits.map(benefit => {
            const totalValue = benefit.annual_value * (program.participants_count || 1);
            const attributionValue = totalValue * (benefit.attribution_percentage / 100);
            const expectedImpact = attributionValue * (benefit.confidence_level / 100);
            return [
              benefit.category,
              `$${totalValue.toLocaleString()}`,
              `$${attributionValue.toLocaleString()} (${benefit.attribution_percentage}%)`,
              `$${expectedImpact.toLocaleString()} (${benefit.confidence_level}% conf)`
            ];
          });
          
          this.addTable(benefitHeaders, benefitRows);
        }
      });

      // Add footnotes if requested
      if (options.includeFootnotes && options.sources) {
        this.addFootnotes(options.sources);
      }

      // Save the PDF with "Resonance" prefix
      this.doc.save(`resonance_${options.title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
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

      // Save the PDF with "Resonance" prefix
      this.doc.save(`resonance_${options.title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Error generating benchmarks PDF:', error);
      throw error;
    }
  }
}