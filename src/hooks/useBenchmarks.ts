import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Benchmark } from '@/types/coaching';

// Fetch all benchmarks
export function useBenchmarks() {
  return useQuery({
    queryKey: ['benchmarks'],
    queryFn: async (): Promise<Benchmark[]> => {
      const { data, error } = await supabase
        .from('benchmarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching benchmarks:', error);
        throw new Error(error.message);
      }

      return (data || []) as Benchmark[];
    },
  });
}

// Fetch a single benchmark by ID
export function useBenchmark(id: string) {
  return useQuery({
    queryKey: ['benchmarks', id],
    queryFn: async (): Promise<Benchmark> => {
      const { data, error } = await supabase
        .from('benchmarks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching benchmark:', error);
        throw new Error(error.message);
      }

      return data as Benchmark;
    },
    enabled: !!id,
  });
}

// Fetch benchmark by label
export function useBenchmarkByLabel(label: string) {
  return useQuery({
    queryKey: ['benchmarks', 'label', label],
    queryFn: async (): Promise<Benchmark | null> => {
      const { data, error } = await supabase
        .from('benchmarks')
        .select('*')
        .eq('label', label)
        .maybeSingle();

      if (error) {
        console.error('Error fetching benchmark by label:', error);
        throw new Error(error.message);
      }

      return data as Benchmark | null;
    },
    enabled: !!label,
  });
}