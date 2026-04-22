import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BenefitCategory } from '@/types/coaching';

export interface BenefitDefaultConfig {
  description: string;
  value: number;
  attribution: number;
  confidence: number;
}

export type BenefitDefaults = Record<BenefitCategory, BenefitDefaultConfig>;

// Fallback defaults when database is unavailable
const DEFAULT_BENEFIT_TEMPLATES: BenefitDefaults = {
  'Productivity Gains': {
    description: 'Increased productivity from improved focus and time management skills per participant',
    value: 10000,
    attribution: 10,
    confidence: 80,
  },
  'Retention Improvement': {
    description: 'Reduced turnover costs per participant through improved employee satisfaction',
    value: 15000,
    attribution: 10,
    confidence: 80,
  },
  'Performance Enhancement': {
    description: 'Improved individual performance metrics per participant',
    value: 10000,
    attribution: 10,
    confidence: 80,
  },
  'Team Effectiveness': {
    description: 'Improved collaboration and team dynamics per participant',
    value: 10000,
    attribution: 10,
    confidence: 80,
  },
  'Decision Making': {
    description: 'Better decision-making per participant leading to cost savings and opportunities',
    value: 10000,
    attribution: 10,
    confidence: 80,
  },
  'Innovation': {
    description: 'Increased innovation and creative problem-solving per participant',
    value: 10000,
    attribution: 10,
    confidence: 80,
  },
  'Customer Satisfaction': {
    description: 'Improved customer relationships and satisfaction scores per participant',
    value: 10000,
    attribution: 10,
    confidence: 80,
  },
  'Other': {
    description: 'Custom benefit description',
    value: 10000,
    attribution: 10,
    confidence: 80,
  },
};

export function useBenefitDefaults() {
  const { data: dbDefaults = [], isLoading } = useQuery({
    queryKey: ['benefit-defaults'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benefit_defaults')
        .select('*')
        .order('category');

      if (error) {
        console.error('Error fetching benefit defaults:', error);
        return [];
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Convert database records to BenefitDefaults format
  const defaults: BenefitDefaults = { ...DEFAULT_BENEFIT_TEMPLATES };
  
  dbDefaults.forEach((dbDefault) => {
    const category = dbDefault.category as BenefitCategory;
    if (category in defaults) {
      defaults[category] = {
        description: dbDefault.description,
        value: Number(dbDefault.default_value),
        attribution: Number(dbDefault.default_attribution),
        confidence: Number(dbDefault.default_confidence),
      };
    }
  });

  const getTemplate = (category: BenefitCategory): BenefitDefaultConfig => {
    return defaults[category] || DEFAULT_BENEFIT_TEMPLATES['Other'];
  };

  const categories = Object.keys(defaults) as BenefitCategory[];

  return {
    defaults,
    getTemplate,
    categories,
    isLoading,
  };
}
