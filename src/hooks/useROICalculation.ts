import { useMemo, useEffect, useRef } from 'react';
import { Program, Benefit, Scenario, ROICalculation, SensitivityData } from '@/types/coaching';
import { calculateAnnualBenefit, calculateProgramROI } from '@/lib/roi-calculations';

// Extended return type to include validation state
export interface ROICalculationResult extends ROICalculation {
  isValid: boolean;
  validationErrors: string[];
}

export function useROICalculation(
  program: Program | null,
  benefits: Benefit[],
  scenario: Scenario | null
): ROICalculationResult | null {
  const previousNpv = useRef<number | null>(null);
  const calculationCount = useRef(0);

  const result = useMemo(() => {
    calculationCount.current += 1;
    const calcId = calculationCount.current;
    
    // Collect validation errors instead of silently returning null
    const validationErrors: string[] = [];
    
    // Log inputs for debugging
    console.log(`[ROI Calc #${calcId}] Inputs:`, {
      hasProgram: !!program,
      programId: program?.id,
      programName: program?.name,
      costPerParticipant: program?.cost_per_participant,
      participantsCount: program?.participants_count,
      overheadCosts: program?.overhead_costs,
      durationMonths: program?.duration_months,
      benefitsCount: benefits.length,
      hasScenario: !!scenario,
      discountRate: scenario?.discount_rate,
    });

    // Validate required inputs
    if (!program) {
      validationErrors.push('Program data not loaded');
    }
    if (!scenario) {
      validationErrors.push('Scenario data not loaded');
    }
    if (benefits.length === 0) {
      validationErrors.push('No benefits defined');
    }

    // If missing critical data, return null with validation info
    if (!program || !scenario || benefits.length === 0) {
      console.log(`[ROI Calc #${calcId}] Skipped - validation errors:`, validationErrors);
      return null;
    }

    // Validate numeric inputs
    const costPerParticipant = program.cost_per_participant;
    const participantsCount = program.participants_count;
    const overheadCosts = program.overhead_costs ?? 0;
    const durationMonths = program.duration_months;
    const discountRate = scenario.discount_rate;

    if (typeof costPerParticipant !== 'number' || isNaN(costPerParticipant) || costPerParticipant < 0) {
      validationErrors.push(`Invalid cost per participant: ${costPerParticipant}`);
    }
    if (typeof participantsCount !== 'number' || isNaN(participantsCount) || participantsCount <= 0) {
      validationErrors.push(`Invalid participants count: ${participantsCount}`);
    }
    if (typeof durationMonths !== 'number' || isNaN(durationMonths) || durationMonths <= 0) {
      validationErrors.push(`Invalid duration months: ${durationMonths}`);
    }
    if (typeof discountRate !== 'number' || isNaN(discountRate)) {
      validationErrors.push(`Invalid discount rate: ${discountRate}`);
    }

    // Calculate total program cost with safety checks
    const totalProgramCost = (costPerParticipant * participantsCount) + overheadCosts;
    
    if (totalProgramCost <= 0) {
      validationErrors.push(`Total program cost is zero or negative: ${totalProgramCost}`);
    }

    // Calculate total annual benefits with attribution (benefits are stored per participant)
    const totalAnnualBenefits = benefits.reduce((sum, benefit, idx) => {
      const annualValue = benefit.annual_value ?? 0;
      const attribution = benefit.attribution_percentage ?? 0;
      const confidence = benefit.confidence_level ?? 0;
      
      // Validate each benefit
      if (typeof annualValue !== 'number' || isNaN(annualValue)) {
        validationErrors.push(`Benefit ${idx}: Invalid annual value: ${annualValue}`);
        return sum;
      }
      if (typeof attribution !== 'number' || isNaN(attribution)) {
        validationErrors.push(`Benefit ${idx}: Invalid attribution: ${attribution}`);
        return sum;
      }
      if (typeof confidence !== 'number' || isNaN(confidence)) {
        validationErrors.push(`Benefit ${idx}: Invalid confidence: ${confidence}`);
        return sum;
      }
      
      return sum + (annualValue * participantsCount * (attribution / 100) * (confidence / 100));
    }, 0);

    const calculation = calculateProgramROI({
      program,
      benefits,
      discountRate,
    });

    // Log the calculated values
    console.log(`[ROI Calc #${calcId}] Output:`, {
      totalInvestment: calculation.totalInvestment,
      annualBenefit: calculateAnnualBenefit(program, benefits),
      totalBenefits: calculation.totalBenefits,
      netBenefit: calculation.netBenefit,
      roi: calculation.roi.toFixed(2),
      paybackPeriod: calculation.paybackPeriod.toFixed(2),
      npv: calculation.npv.toFixed(2),
      analysisYears: calculation.analysisYears,
      validationErrors,
    });

    // Check for NPV changes
    if (previousNpv.current !== null && Math.abs(previousNpv.current - calculation.npv) > 0.01) {
      console.warn(`[ROI Calc #${calcId}] NPV CHANGED from ${previousNpv.current.toFixed(2)} to ${calculation.npv.toFixed(2)}`);
    }
    previousNpv.current = calculation.npv;

    return {
      ...calculation,
      isValid: validationErrors.length === 0,
      validationErrors,
    };
  }, [program, benefits, scenario]);

  // Log when calculation result changes
  useEffect(() => {
    if (result) {
      console.log('[ROI Calc] Result updated:', {
        npv: result.npv.toFixed(2),
        roi: result.roi.toFixed(2),
        isValid: result.isValid,
        errorCount: result.validationErrors.length,
      });
    } else {
      console.log('[ROI Calc] Result is null (missing inputs)');
    }
  }, [result]);

  return result;
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
