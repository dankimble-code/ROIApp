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

  private addTable(headers: string[], rows: string[][], customWidths?: number[]): void {
    this.checkPageBreak(30);
    
    const startY = this.currentY;
    const tableWidth = this.pageWidth - 40;
    
    // Use custom widths if provided, otherwise calculate proportionally
    let colWidths: number[];
    if (customWidths && customWidths.length === headers.length) {
      const totalRatio = customWidths.reduce((sum, w) => sum + w, 0);
      colWidths = customWidths.map(w => (w / totalRatio) * tableWidth);
    } else {
      colWidths = headers.map(() => tableWidth / headers.length);
    }
    
    // Calculate x positions for each column
    const colPositions: number[] = [20];
    for (let i = 0; i < colWidths.length - 1; i++) {
      colPositions.push(colPositions[i] + colWidths[i]);
    }
    
    // Headers
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(20, startY - 5, tableWidth, 10, 'F');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    headers.forEach((header, index) => {
      const truncated = this.truncateText(header, colWidths[index] - 5, 10);
      this.doc.text(truncated, colPositions[index] + 3, startY);
    });
    
    this.currentY = startY + 10;
    
    // Rows
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    rows.forEach((row, rowIndex) => {
      this.checkPageBreak(8);
      
      if (rowIndex % 2 === 1) {
        this.doc.setFillColor(250, 250, 250);
        this.doc.rect(20, this.currentY - 5, tableWidth, 8, 'F');
      }
      
      row.forEach((cell, cellIndex) => {
        const truncated = this.truncateText(cell, colWidths[cellIndex] - 5, 9);
        this.doc.text(truncated, colPositions[cellIndex] + 3, this.currentY);
      });
      
      this.currentY += 8;
    });
    
    this.currentY += 5;
  }

  private truncateText(text: string, maxWidth: number, fontSize: number): string {
    this.doc.setFontSize(fontSize);
    if (this.doc.getTextWidth(text) <= maxWidth) {
      return text;
    }
    
    let truncated = text;
    while (truncated.length > 3 && this.doc.getTextWidth(truncated + '...') > maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '...';
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
    const buildTime = typeof __BUILD_TIME__ !== 'undefined' ? new Date(__BUILD_TIME__).toLocaleString() : 'Development';
    this.doc.text(`Build Version: ${buildTime}`, 20, this.currentY);
    this.currentY += 4;
    this.doc.text('https://resonanceexecutivecoaching.com/ | Contact: daniel@resonanceexecutivecoaching.com', 20, this.currentY);
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
            program.name,
            `${calc.roi.toFixed(1)}%`,
            `$${calc.npv.toLocaleString()}`,
            `$${calc.netBenefit.toLocaleString()}`,
            `${calc.paybackPeriod.toFixed(1)} yrs`
          ];
        });
        
        // Custom widths: Program (wider), ROI, NPV, Net Benefit, Payback
        this.addTable(roiHeaders, roiRows, [3, 1, 2, 2, 1]);
      }

      // Program Overview Table
      if (data.programs.length > 0) {
        this.addSection('Program Overview');
        
        const headers = ['Program Name', 'Organization', 'Participants', 'Duration', 'Investment'];
        const rows = data.programs.map(program => [
          program.name,
          program.organization?.name || 'N/A',
          program.participants_count.toString(),
          `${program.duration_months} mo`,
          `$${((program.cost_per_participant * program.participants_count) + (program.overhead_costs || 0)).toLocaleString()}`
        ]);
        
        // Custom widths: Program (wider), Org (wider), Participants, Duration, Investment
        this.addTable(headers, rows, [2.5, 2.5, 1, 1, 1.5]);
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
          const yearHeaders = ['Year', 'Annual Benefits', 'Cumulative', 'Net Value'];
          
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
          // Custom widths: Year, Annual, Cumulative, Net Value
          this.addTable(yearHeaders, yearRows, [1, 2, 2, 2]);
        } else {
          this.addText('ROI Analysis: Not available - add benefits to calculate ROI', 10);
        }

        // Benefits Breakdown - Table style like app display
        if (programBenefits.length > 0) {
          this.currentY += 3;
          
          // Total Investment Summary
          this.addText('Program Investment:', 11, true);
          this.addText(`• Total Program Investment: $${totalInvestment.toLocaleString()}`, 10);
          this.addText(`• Investment per Employee: $${program.cost_per_participant.toLocaleString()}`, 10);
          if (overheadCost > 0) {
            this.addText(`• Overhead Costs: $${overheadCost.toLocaleString()}`, 10);
          }
          this.currentY += 3;
          
          this.addText(`Program Benefits & Expected Outcomes (${programBenefits.length} defined):`, 11, true);
          
          // Table headers for benefits - match app display style
          const benefitHeaders = ['Benefit Category', 'Total Benefit (ROI)', 'Attribution', 'Confidence'];
          const benefitRows = programBenefits.map(benefit => {
            const totalValue = benefit.annual_value * (program.participants_count || 1);
            const attributionValue = totalValue * (benefit.attribution_percentage / 100);
            const totalBenefitROI = attributionValue * (benefit.confidence_level / 100);
            return [
              benefit.category,
              `$${Math.round(totalBenefitROI).toLocaleString()}`,
              `${benefit.attribution_percentage}%`,
              `${benefit.confidence_level}%`
            ];
          });
          
          // Custom widths: Category (wider), Benefit (wider), Attribution, Confidence
          this.addTable(benefitHeaders, benefitRows, [3, 2.5, 1.5, 1.5]);

          // Total benefits summary
          const totalBenefitROI = programBenefits.reduce((sum, b) => {
            const totalValue = b.annual_value * (program.participants_count || 1);
            const attributionValue = totalValue * (b.attribution_percentage / 100);
            return sum + (attributionValue * (b.confidence_level / 100));
          }, 0);
          this.currentY += 2;
          this.addText(`Total Benefit (ROI): $${totalBenefitROI.toLocaleString()}`, 10, true);
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
      const isSingleProgram = data.programs.length === 1;
      
      // Load and add logo if requested
      if (options.includeLogo) {
        const logoData = await this.loadLogo();
        this.doc.addImage(logoData, 'PNG', 20, 10, 40, this.logoHeight);
      }

      this.addHeader(options.title, options.subtitle, options.includeLogo);

      // For single program, format like the ROI Calculation Summary page
      if (isSingleProgram) {
        const program = data.programs[0];
        const calculation = data.calculations[program.id];
        const programBenefits = data.benefits[program.id] || [];
        const totalInvestment = calculation?.totalInvestment || 0;
        const overheadCosts = program.overhead_costs || 0;
        const participantCost = program.cost_per_participant * program.participants_count;
        const analysisYears = 5;
        
        // Calculate total benefit ROI
        const totalBenefitROI = programBenefits.reduce((sum, b) => {
          const totalValue = b.annual_value * (program.participants_count || 1);
          const attributionValue = totalValue * (b.attribution_percentage / 100);
          return sum + (attributionValue * (b.confidence_level / 100));
        }, 0);

        // ROI Overview Section - matching the 4-card layout
        this.addSection('ROI Overview');
        
        const roiHeaders = ['ROI (5-Year)', 'Net Present Value (5-Year)', 'Payback Period', 'Benefit Multiple'];
        const roiValues = [
          `${calculation?.roi >= 0 ? '+' : ''}${calculation?.roi.toFixed(1) || '0.0'}%`,
          `$${Math.round(totalBenefitROI * analysisYears - totalInvestment).toLocaleString()}`,
          `${calculation?.paybackPeriod.toFixed(1) || 'N/A'} mo`,
          `${((totalBenefitROI * analysisYears) / totalInvestment).toFixed(1)}x`
        ];
        const roiDescriptions = [
          `Net benefits over ${analysisYears} years`,
          'Present value of future benefits minus investment',
          'Time to break even',
          'Total benefits ÷ investment'
        ];
        
        // Display as a formatted metrics box
        this.doc.setFillColor(245, 250, 245);
        this.doc.rect(20, this.currentY - 3, this.pageWidth - 40, 35, 'F');
        
        const metricsStartY = this.currentY;
        const colWidth = (this.pageWidth - 40) / 4;
        
        roiHeaders.forEach((header, index) => {
          const xPos = 20 + (colWidth * index) + 5;
          
          this.doc.setFontSize(8);
          this.doc.setFont('helvetica', 'normal');
          this.doc.setTextColor(100, 100, 100);
          this.doc.text(header, xPos, metricsStartY);
          
          this.doc.setFontSize(16);
          this.doc.setFont('helvetica', 'bold');
          this.doc.setTextColor(34, 139, 34); // Green for positive metrics
          this.doc.text(roiValues[index], xPos, metricsStartY + 12);
          
          this.doc.setFontSize(7);
          this.doc.setFont('helvetica', 'normal');
          this.doc.setTextColor(120, 120, 120);
          const descLines = this.doc.splitTextToSize(roiDescriptions[index], colWidth - 10);
          this.doc.text(descLines, xPos, metricsStartY + 20);
        });
        
        this.currentY = metricsStartY + 40;
        this.doc.setTextColor(0, 0, 0);

        // Program Investment Section
        this.addSection('Program Investment');
        
        // Two-column layout for Organization and Program Costs
        const leftColX = 20;
        const rightColX = this.pageWidth / 2 + 10;
        const sectionStartY = this.currentY;
        
        // Organization column
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Organization', leftColX, this.currentY);
        this.currentY += 8;
        
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(100, 100, 100);
        this.doc.text('Company:', leftColX, this.currentY);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(program.organization?.name || 'N/A', leftColX + 40, this.currentY);
        this.currentY += 6;
        
        this.doc.setTextColor(100, 100, 100);
        this.doc.text('Industry:', leftColX, this.currentY);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text((program.organization as any)?.industry || 'N/A', leftColX + 40, this.currentY);
        this.currentY += 6;
        
        this.doc.setTextColor(100, 100, 100);
        this.doc.text('Employees:', leftColX, this.currentY);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(((program.organization as any)?.employee_count || 'N/A').toString(), leftColX + 40, this.currentY);
        
        // Program Costs column (start from same Y as Organization)
        let rightY = sectionStartY;
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Program Costs', rightColX, rightY);
        rightY += 8;
        
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(100, 100, 100);
        this.doc.text('Cost per participant:', rightColX, rightY);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(`$${program.cost_per_participant.toLocaleString()}`, rightColX + 55, rightY);
        rightY += 6;
        
        this.doc.setTextColor(100, 100, 100);
        this.doc.text('Participants:', rightColX, rightY);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(program.participants_count.toString(), rightColX + 55, rightY);
        rightY += 6;
        
        this.doc.setTextColor(100, 100, 100);
        this.doc.text('Overhead costs:', rightColX, rightY);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(`$${overheadCosts.toLocaleString()}`, rightColX + 55, rightY);
        rightY += 8;
        
        // Separator line
        this.doc.setDrawColor(200, 200, 200);
        this.doc.line(rightColX, rightY, this.pageWidth - 20, rightY);
        rightY += 6;
        
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Total Investment:', rightColX, rightY);
        this.doc.text(`$${totalInvestment.toLocaleString()}`, rightColX + 55, rightY);
        
        this.currentY = Math.max(this.currentY, rightY) + 15;
        this.doc.setTextColor(0, 0, 0);

        // Benefits Analysis Section
        if (programBenefits.length > 0) {
          this.addSection('Benefits Analysis');
          
          programBenefits.forEach((benefit, index) => {
            const totalValue = benefit.annual_value * (program.participants_count || 1);
            const attributionValue = totalValue * (benefit.attribution_percentage / 100);
            const benefitROI = attributionValue * (benefit.confidence_level / 100);
            
            this.checkPageBreak(25);
            
            // Benefit box
            this.doc.setFillColor(250, 250, 252);
            this.doc.roundedRect(20, this.currentY - 3, this.pageWidth - 40, 22, 2, 2, 'F');
            
            // Category badge and attribution/confidence badges
            this.doc.setFontSize(8);
            this.doc.setFont('helvetica', 'bold');
            this.doc.setTextColor(51, 65, 122);
            this.doc.text(benefit.category, 25, this.currentY + 3);
            
            // Attribution badge
            this.doc.setFillColor(230, 230, 240);
            this.doc.roundedRect(25 + this.doc.getTextWidth(benefit.category) + 5, this.currentY - 1, 35, 8, 2, 2, 'F');
            this.doc.setFontSize(7);
            this.doc.setTextColor(51, 65, 122);  // Resonance Navy for better contrast
            this.doc.text(`${benefit.attribution_percentage}% attribution`, 27 + this.doc.getTextWidth(benefit.category) + 5, this.currentY + 4);
            
            // Confidence badge
            const attrBadgeEnd = 25 + this.doc.getTextWidth(benefit.category) + 45;
            this.doc.setFillColor(benefit.confidence_level >= 80 ? 220 : 240, benefit.confidence_level >= 80 ? 240 : 240, benefit.confidence_level >= 80 ? 220 : 245);
            this.doc.roundedRect(attrBadgeEnd, this.currentY - 1, 35, 8, 2, 2, 'F');
            this.doc.setTextColor(51, 65, 122);  // Resonance Navy for better contrast
            this.doc.text(`${benefit.confidence_level}% confidence`, attrBadgeEnd + 2, this.currentY + 4);
            
            // Description
            this.doc.setFontSize(8);
            this.doc.setFont('helvetica', 'normal');
            this.doc.setTextColor(100, 100, 100);
            const descText = this.doc.splitTextToSize(benefit.description || '', this.pageWidth - 60);
            this.doc.text(descText[0] || '', 25, this.currentY + 10);
            
            // Total Benefit (ROI) value
            this.doc.setFontSize(7);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text('Total Benefit (ROI):', 25, this.currentY + 16);
            this.doc.setFontSize(11);
            this.doc.setFont('helvetica', 'bold');
            this.doc.setTextColor(51, 65, 122);
            this.doc.text(`$${Math.round(benefitROI).toLocaleString()}`, 70, this.currentY + 16);
            
            this.currentY += 28;
          });
          
          // Separator
          this.doc.setDrawColor(200, 200, 200);
          this.doc.line(20, this.currentY, this.pageWidth - 20, this.currentY);
          this.currentY += 10;
          
          // Summary totals
          const summaryStartY = this.currentY;
          
          // Left: Total Program Investment
          this.doc.setFontSize(9);
          this.doc.setFont('helvetica', 'normal');
          this.doc.setTextColor(100, 100, 100);
          this.doc.text('Total Program Investment:', 20, this.currentY);
          this.doc.setFontSize(14);
          this.doc.setFont('helvetica', 'bold');
          this.doc.setTextColor(0, 0, 0);
          this.doc.text(`$${totalInvestment.toLocaleString()}`, 20, this.currentY + 8);
          this.doc.setFontSize(8);
          this.doc.setFont('helvetica', 'normal');
          this.doc.setTextColor(120, 120, 120);
          this.doc.text(`Per employee: $${program.cost_per_participant.toLocaleString()}`, 20, this.currentY + 14);
          if (overheadCosts > 0) {
            this.doc.text(`Overhead costs: $${overheadCosts.toLocaleString()}`, 20, this.currentY + 19);
          }
          
          // Right: Total Benefit (ROI)
          const rightX = this.pageWidth / 2 + 10;
          this.doc.setFontSize(9);
          this.doc.setTextColor(100, 100, 100);
          this.doc.text('Total Benefit (ROI):', rightX, summaryStartY);
          this.doc.setFontSize(14);
          this.doc.setFont('helvetica', 'bold');
          this.doc.setTextColor(51, 65, 122);
          this.doc.text(`$${Math.round(totalBenefitROI).toLocaleString()}`, rightX, summaryStartY + 8);
          
          this.currentY = summaryStartY + 25;
          this.doc.setTextColor(0, 0, 0);
        }

      } else {
        // Multiple programs - comparison format
        this.addSection('Programs Summary');
        this.addText(`This report analyzes ${data.programs.length} executive coaching programs across key performance and financial metrics.`);

        // Side-by-Side Table
        this.addSection('Program Metrics');
        
        const headers = ['Metric', ...data.programs.map(p => p.name)];
        const rows = [
          ['Organization', ...data.programs.map(p => p.organization?.name || 'N/A')],
          ['Duration', ...data.programs.map(p => `${p.duration_months} months`)],
          ['Participants', ...data.programs.map(p => p.participants_count.toString())],
          ['Cost per Participant', ...data.programs.map(p => `$${p.cost_per_participant.toLocaleString()}`)],
          ['Total Investment', ...data.programs.map(p => `$${data.calculations[p.id]?.totalInvestment.toLocaleString() || 'N/A'}`)],
          ['Expected ROI (5-Year)', ...data.programs.map(p => `${data.calculations[p.id]?.roi.toFixed(1) || '0.0'}%`)],
          ['Payback Period', ...data.programs.map(p => `${data.calculations[p.id]?.paybackPeriod.toFixed(1) || 'N/A'} mo`)]
        ];
        
        const colWidths = [2, ...data.programs.map(() => 3)];
        this.addTable(headers, rows, colWidths);

        // Program Details
        data.programs.forEach(program => {
          this.addSection(`${program.name} - Details`);
          
          const calculation = data.calculations[program.id];
          if (calculation) {
            this.addText(`Total Investment: $${calculation.totalInvestment.toLocaleString()}`, 12, true);
            this.addText(`Expected ROI (5-Year): ${calculation.roi.toFixed(1)}%`, 12, true);
            this.addText(`Payback Period: ${calculation.paybackPeriod.toFixed(1)} months`, 12, true);
          }

          const programBenefits = data.benefits[program.id];
          if (programBenefits && programBenefits.length > 0) {
            this.addText('Benefits:', 12, true);
            
            const benefitHeaders = ['Benefit Category', 'Total Benefit (ROI)', 'Attribution', 'Confidence'];
            const benefitRows = programBenefits.map(benefit => {
              const totalValue = benefit.annual_value * (program.participants_count || 1);
              const attributionValue = totalValue * (benefit.attribution_percentage / 100);
              const totalBenefitROI = attributionValue * (benefit.confidence_level / 100);
              return [
                benefit.category,
                `$${Math.round(totalBenefitROI).toLocaleString()}`,
                `${benefit.attribution_percentage}%`,
                `${benefit.confidence_level}%`
              ];
            });
            
            this.addTable(benefitHeaders, benefitRows, [3, 2.5, 1.5, 1.5]);
          }
        });
      }

      // Add footnotes if requested
      if (options.includeFootnotes && options.sources) {
        this.addFootnotes(options.sources);
      }

      // Save the PDF with "Resonance" prefix
      this.doc.save(`resonance_${options.title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
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