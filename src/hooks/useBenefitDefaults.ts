import { useState, useEffect } from 'react';
import { BenefitCategory, BENEFIT_CATEGORIES } from '@/types/coaching';

export interface BenefitDefaultConfig {
  description: string;
  value: number;
  attribution: number;
}

export type BenefitDefaults = Record<BenefitCategory, BenefitDefaultConfig>;

const DEFAULT_BENEFIT_TEMPLATES: BenefitDefaults = {
  'Productivity Gains': {
    description: 'Increased productivity from improved focus and time management skills per participant',
    value: 10000,
    attribution: 50,
  },
  'Retention Improvement': {
    description: 'Reduced turnover costs per participant through improved employee satisfaction',
    value: 15000,
    attribution: 50,
  },
  'Performance Enhancement': {
    description: 'Improved individual performance metrics per participant',
    value: 10000,
    attribution: 50,
  },
  'Decision Making': {
    description: 'Better decision-making per participant leading to cost savings and opportunities',
    value: 10000,
    attribution: 50,
  },
  'Team Effectiveness': {
    description: 'Improved collaboration and team dynamics per participant',
    value: 10000,
    attribution: 50,
  },
  'Innovation': {
    description: 'Increased innovation and creative problem-solving per participant',
    value: 10000,
    attribution: 50,
  },
  'Customer Satisfaction': {
    description: 'Improved customer relationships and satisfaction scores per participant',
    value: 10000,
    attribution: 50,
  },
  'Other': {
    description: 'Custom benefit specific to your organization per participant',
    value: 10000,
    attribution: 50,
  },
};

const STORAGE_KEY = 'benefit-defaults';

export function useBenefitDefaults() {
  const [defaults, setDefaults] = useState<BenefitDefaults>(DEFAULT_BENEFIT_TEMPLATES);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDefaults({ ...DEFAULT_BENEFIT_TEMPLATES, ...parsed });
      } catch (e) {
        console.error('Failed to parse benefit defaults:', e);
      }
    }
  }, []);

  const updateDefault = (category: BenefitCategory, config: Partial<BenefitDefaultConfig>) => {
    setDefaults(prev => {
      const updated = {
        ...prev,
        [category]: { ...prev[category], ...config }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetDefaults = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDefaults(DEFAULT_BENEFIT_TEMPLATES);
  };

  const getTemplate = (category: BenefitCategory): BenefitDefaultConfig => {
    return defaults[category] || DEFAULT_BENEFIT_TEMPLATES[category];
  };

  return {
    defaults,
    updateDefault,
    resetDefaults,
    getTemplate,
    categories: BENEFIT_CATEGORIES,
  };
}
