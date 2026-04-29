import assert from 'node:assert/strict';

import { calculateProgramROI } from '../src/lib/roi-calculations.ts';

const calculation = calculateProgramROI({
  program: {
    duration_months: 12,
    participants_count: 12,
    cost_per_participant: 10000,
    overhead_costs: 5000,
  },
  benefits: [
    {
      annual_value: 6000,
      attribution_percentage: 100,
      confidence_level: 100,
      category: 'Other',
    },
  ],
  analysisYears: 5,
  discountRate: 10,
});

const approxEqual = (actual: number, expected: number, tolerance: number, label: string) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label} expected ${expected}, received ${actual}`
  );
};

assert.equal(calculation.totalInvestment, 125000, 'totalInvestment');
assert.equal(calculation.annualBenefit, 72000, 'annualBenefit');
assert.equal(calculation.totalBenefits, 360000, 'totalBenefits');
approxEqual(calculation.roi, 188, 0.001, 'roi');
approxEqual(calculation.benefitMultiple, 2.88, 0.001, 'benefitMultiple');
approxEqual(calculation.paybackPeriod, 20.8333333333, 0.001, 'paybackPeriod');
approxEqual(calculation.npv, 147935.79, 0.1, 'npv');

assert.deepEqual(
  calculation.yearlyBreakdown.map((year) => ({
    year: year.year,
    netCashFlow: year.netCashFlow,
    cumulativeCashFlow: year.cumulativeCashFlow,
  })),
  [
    { year: 0, netCashFlow: -125000, cumulativeCashFlow: -125000 },
    { year: 1, netCashFlow: 72000, cumulativeCashFlow: -53000 },
    { year: 2, netCashFlow: 72000, cumulativeCashFlow: 19000 },
    { year: 3, netCashFlow: 72000, cumulativeCashFlow: 91000 },
    { year: 4, netCashFlow: 72000, cumulativeCashFlow: 163000 },
    { year: 5, netCashFlow: 72000, cumulativeCashFlow: 235000 },
  ],
  'yearly cash flow breakdown'
);

console.log('ROI sanity check passed.');
console.log(
  JSON.stringify(
    {
      totalInvestment: calculation.totalInvestment,
      annualBenefit: calculation.annualBenefit,
      totalBenefits: calculation.totalBenefits,
      roi: calculation.roi,
      benefitMultiple: calculation.benefitMultiple,
      paybackPeriod: calculation.paybackPeriod,
      npv: calculation.npv,
    },
    null,
    2
  )
);
