import { Benefit, Program, ROICalculation } from '@/types/coaching';

const DEFAULT_ANALYSIS_YEARS = 5;
const DEFAULT_DISCOUNT_RATE = 0.08;

export interface ROIInputs {
  program: Pick<Program, 'duration_months' | 'participants_count' | 'cost_per_participant' | 'overhead_costs'>;
  benefits: Array<Pick<Benefit, 'annual_value' | 'attribution_percentage' | 'confidence_level' | 'category'>>;
  discountRate?: number;
  analysisYears?: number;
}

export function getAnalysisYears(durationMonths: number): number {
  return Math.max(DEFAULT_ANALYSIS_YEARS, Math.ceil(durationMonths / 12));
}

export function normalizeDiscountRate(discountRate: number = DEFAULT_DISCOUNT_RATE): number {
  if (!Number.isFinite(discountRate)) {
    return DEFAULT_DISCOUNT_RATE;
  }

  const normalizedRate = discountRate > 1 ? discountRate / 100 : discountRate;
  return Math.max(0, normalizedRate);
}

export function calculateUpfrontInvestment(
  program: Pick<Program, 'participants_count' | 'cost_per_participant' | 'overhead_costs'>
): number {
  return (program.cost_per_participant * program.participants_count) + (program.overhead_costs || 0);
}

export function calculateAnnualBenefit(
  program: Pick<Program, 'participants_count'>,
  benefits: ROIInputs['benefits']
): number {
  return benefits.reduce((sum, benefit) => {
    return sum + (
      benefit.annual_value *
      program.participants_count *
      (benefit.attribution_percentage / 100) *
      (benefit.confidence_level / 100)
    );
  }, 0);
}

export function calculateProgramROI({
  program,
  benefits,
  discountRate = DEFAULT_DISCOUNT_RATE,
  analysisYears = getAnalysisYears(program.duration_months),
}: ROIInputs): ROICalculation {
  const normalizedDiscountRate = normalizeDiscountRate(discountRate);
  const totalInvestment = calculateUpfrontInvestment(program);
  const annualBenefit = calculateAnnualBenefit(program, benefits);
  const totalBenefits = annualBenefit * analysisYears;
  const netBenefit = totalBenefits - totalInvestment;
  const roi = totalInvestment > 0 ? (netBenefit / totalInvestment) * 100 : 0;
  const benefitMultiple = totalInvestment > 0 ? totalBenefits / totalInvestment : 0;
  const paybackPeriod = annualBenefit > 0 ? totalInvestment / (annualBenefit / 12) : Number.POSITIVE_INFINITY;

  let npv = -totalInvestment;
  const yearlyBreakdown: ROICalculation['yearlyBreakdown'] = [
    {
      year: 0,
      benefits: 0,
      costs: totalInvestment,
      netCashFlow: -totalInvestment,
      cumulativeCashFlow: -totalInvestment,
      discountedCashFlow: -totalInvestment,
    },
  ];

  let cumulativeCashFlow = -totalInvestment;
  for (let year = 1; year <= analysisYears; year++) {
    const discountedCashFlow = annualBenefit / Math.pow(1 + normalizedDiscountRate, year);
    cumulativeCashFlow += annualBenefit;
    npv += discountedCashFlow;

    yearlyBreakdown.push({
      year,
      benefits: annualBenefit,
      costs: 0,
      netCashFlow: annualBenefit,
      cumulativeCashFlow,
      discountedCashFlow,
    });
  }

  return {
    totalInvestment,
    annualBenefit,
    totalBenefits,
    netBenefit,
    roi,
    paybackPeriod,
    benefitMultiple,
    npv,
    analysisYears,
    yearlyBreakdown,
  };
}

/*
Sanity check for the shared ROI formulas:
- upfront investment: 125000
- annual benefit: 72000
- analysis years: 5
- discount rate: 10%
Expected results:
- total benefits = 360000
- ROI = 188%
- benefit multiple = 2.88x
- payback period = 20.83 months
- NPV ~= 147936.89
*/
