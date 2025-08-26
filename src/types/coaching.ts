export interface Organization {
  id: string;
  name: string;
  industry?: string;
  employee_count?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  organization_id: string;
  name: string;
  duration_months: number;
  participants_count: number;
  cost_per_participant: number;
  overhead_costs: number;
  created_at: string;
  updated_at: string;
}

export interface Benefit {
  id: string;
  program_id: string;
  category: string;
  description: string;
  annual_value: number;
  attribution_percentage: number;
  confidence_level: number;
  created_at: string;
  updated_at: string;
}

export interface Scenario {
  id: string;
  program_id: string;
  name: string;
  description?: string;
  discount_rate: number;
  is_baseline: boolean;
  created_at: string;
  updated_at: string;
}

export interface Benchmark {
  id: string;
  label: string;
  data: {
    coaching_effectiveness: number;
    roi_range: { min: number; max: number };
    average_program_duration: number;
    typical_cost_per_participant: number;
    success_factors: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: any;
  new_values?: any;
  timestamp: string;
}

export interface ROICalculation {
  totalInvestment: number;
  totalBenefits: number;
  netBenefit: number;
  roi: number;
  paybackPeriod: number;
  npv: number;
  yearlyBreakdown: {
    year: number;
    benefits: number;
    costs: number;
    netCashFlow: number;
    cumulativeCashFlow: number;
    discountedCashFlow: number;
  }[];
}

export interface SensitivityData {
  parameter: string;
  baseValue: number;
  lowValue: number;
  highValue: number;
  lowROI: number;
  highROI: number;
  impact: number;
}

export type BenefitCategory = 
  | 'Productivity Gains'
  | 'Leadership Development'
  | 'Retention Improvement'
  | 'Performance Enhancement'
  | 'Decision Making'
  | 'Team Effectiveness'
  | 'Innovation'
  | 'Customer Satisfaction'
  | 'Other';

export const BENEFIT_CATEGORIES: BenefitCategory[] = [
  'Productivity Gains',
  'Leadership Development', 
  'Retention Improvement',
  'Performance Enhancement',
  'Decision Making',
  'Team Effectiveness',
  'Innovation',
  'Customer Satisfaction',
  'Other'
];