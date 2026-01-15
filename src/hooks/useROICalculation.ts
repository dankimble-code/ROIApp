import { useMemo } from 'react';
import { Program, Benefit, Scenario, ROICalculation, SensitivityData } from '@/types/coaching';

export function useROICalculation(
  program: Program | null,
  benefits: Benefit[],
  scenario: Scenario | null
): ROICalculation | null {
  return useMemo(() => {
    if (!program || !scenario || benefits.length === 0) return null;

    const totalProgramCost = (program.cost_per_participant * program.participants_count) + program.overhead_costs;
    const annualCosts = totalProgramCost / program.duration_months * 12;
    
    // Calculate total annual benefits with attribution (benefits are stored per participant)
    const totalAnnualBenefits = benefits.reduce((sum, benefit) => {
      return sum + (benefit.annual_value * program.participants_count * (benefit.attribution_percentage / 100) * (benefit.confidence_level / 100));
    }, 0);

    const discountRate = scenario.discount_rate;
    const analysisYears = Math.max(5, Math.ceil(program.duration_months / 12) + 2);

    const yearlyBreakdown = [];
    let cumulativeCashFlow = -totalProgramCost;
    let npv = -totalProgramCost;
    let paybackPeriod = 0;

    for (let year = 1; year <= analysisYears; year++) {
      const isCoachingYear = year <= Math.ceil(program.duration_months / 12);
      const costs = isCoachingYear ? annualCosts : 0;
      const benefits = year <= Math.ceil(program.duration_months / 12) ? 
        totalAnnualBenefits * (year / Math.ceil(program.duration_months / 12)) : 
        totalAnnualBenefits;

      const netCashFlow = benefits - costs;
      cumulativeCashFlow += netCashFlow;
      
      const discountedCashFlow = netCashFlow / Math.pow(1 + discountRate, year);
      npv += discountedCashFlow;

      if (paybackPeriod === 0 && cumulativeCashFlow >= 0) {
        const previousCumulative = cumulativeCashFlow - netCashFlow;
        paybackPeriod = year - 1 + Math.abs(previousCumulative) / netCashFlow;
      }

      yearlyBreakdown.push({
        year,
        benefits,
        costs,
        netCashFlow,
        cumulativeCashFlow,
        discountedCashFlow
      });
    }

    const totalInvestment = totalProgramCost;
    const totalBenefits = totalAnnualBenefits * analysisYears;
    const netBenefit = totalBenefits - totalInvestment;
    const roi = (netBenefit / totalInvestment) * 100;

    return {
      totalInvestment,
      totalBenefits,
      netBenefit,
      roi,
      paybackPeriod: paybackPeriod || analysisYears,
      npv,
      analysisYears,
      yearlyBreakdown
    };
  }, [program, benefits, scenario]);
}

export function useSensitivityAnalysis(
  program: Program | null,
  benefits: Benefit[],
  scenario: Scenario | null,
  baseROI: number
): SensitivityData[] {
  return useMemo(() => {
    if (!program || !scenario || benefits.length === 0 || !baseROI) return [];

    const sensitivityData: SensitivityData[] = [];
    const variationPercent = 0.2; // 20% variation

    // Cost per participant sensitivity
    const baseCostPerParticipant = program.cost_per_participant;
    const lowCost = baseCostPerParticipant * (1 - variationPercent);
    const highCost = baseCostPerParticipant * (1 + variationPercent);
    
    const lowCostROI = calculateROIForCostChange(lowCost, baseCostPerParticipant, baseROI);
    const highCostROI = calculateROIForCostChange(highCost, baseCostPerParticipant, baseROI);
    
    sensitivityData.push({
      parameter: 'Cost per Participant',
      baseValue: baseCostPerParticipant,
      lowValue: lowCost,
      highValue: highCost,
      lowROI: lowCostROI,
      highROI: highCostROI,
      impact: Math.abs(highCostROI - lowCostROI)
    });

    // Benefits sensitivity
    const totalBenefits = benefits.reduce((sum, b) => sum + b.annual_value, 0);
    const lowBenefits = totalBenefits * (1 - variationPercent);
    const highBenefits = totalBenefits * (1 + variationPercent);
    
    const lowBenefitsROI = calculateROIForBenefitsChange(lowBenefits, totalBenefits, baseROI);
    const highBenefitsROI = calculateROIForBenefitsChange(highBenefits, totalBenefits, baseROI);
    
    sensitivityData.push({
      parameter: 'Annual Benefits',
      baseValue: totalBenefits,
      lowValue: lowBenefits,
      highValue: highBenefits,
      lowROI: lowBenefitsROI,
      highROI: highBenefitsROI,
      impact: Math.abs(highBenefitsROI - lowBenefitsROI)
    });

    // Discount rate sensitivity
    const baseDiscountRate = scenario.discount_rate;
    const lowDiscountRate = Math.max(0.01, baseDiscountRate - 0.02);
    const highDiscountRate = baseDiscountRate + 0.02;
    
    sensitivityData.push({
      parameter: 'Discount Rate',
      baseValue: baseDiscountRate * 100,
      lowValue: lowDiscountRate * 100,
      highValue: highDiscountRate * 100,
      lowROI: baseROI * 1.1, // Approximate impact
      highROI: baseROI * 0.9,
      impact: baseROI * 0.2
    });

    return sensitivityData.sort((a, b) => b.impact - a.impact);
  }, [program, benefits, scenario, baseROI]);
}

function calculateROIForCostChange(newCost: number, baseCost: number, baseROI: number): number {
  const costRatio = newCost / baseCost;
  // Simplified ROI calculation - in practice would recalculate full ROI
  return baseROI / costRatio;
}

function calculateROIForBenefitsChange(newBenefits: number, baseBenefits: number, baseROI: number): number {
  const benefitsRatio = newBenefits / baseBenefits;
  // Simplified ROI calculation - in practice would recalculate full ROI
  return baseROI * benefitsRatio;
}