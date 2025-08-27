import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Scenario } from '@/types/coaching';

type CreateScenarioData = Omit<Scenario, 'id' | 'created_at' | 'updated_at'>;
type UpdateScenarioData = Partial<Omit<Scenario, 'id' | 'created_at' | 'updated_at'>>;

export function useScenarios(programId: string | null) {
  return useQuery({
    queryKey: ['scenarios', programId],
    queryFn: async () => {
      if (!programId) return [];
      
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('program_id', programId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Scenario[];
    },
    enabled: !!programId,
  });
}

export function useScenario(id: string) {
  return useQuery({
    queryKey: ['scenario', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Scenario | null;
    },
    enabled: !!id,
  });
}

export function useBaselineScenario(programId: string | null) {
  return useQuery({
    queryKey: ['baseline-scenario', programId],
    queryFn: async () => {
      if (!programId) return null;
      
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('program_id', programId)
        .eq('is_baseline', true)
        .maybeSingle();

      if (error) throw error;
      return data as Scenario | null;
    },
    enabled: !!programId,
  });
}

export function useCreateScenario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateScenarioData) => {
      const { data: scenario, error } = await supabase
        .from('scenarios')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return scenario;
    },
    onSuccess: (scenario) => {
      queryClient.invalidateQueries({ queryKey: ['scenarios', scenario.program_id] });
      queryClient.invalidateQueries({ queryKey: ['baseline-scenario', scenario.program_id] });
      toast({
        title: "Scenario created",
        description: "The scenario has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create scenario. Please try again.",
        variant: "destructive",
      });
      console.error('Create scenario error:', error);
    },
  });
}

export function useUpdateScenario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateScenarioData }) => {
      const { data: scenario, error } = await supabase
        .from('scenarios')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return scenario;
    },
    onSuccess: (scenario) => {
      queryClient.invalidateQueries({ queryKey: ['scenarios', scenario.program_id] });
      queryClient.invalidateQueries({ queryKey: ['baseline-scenario', scenario.program_id] });
      queryClient.invalidateQueries({ queryKey: ['scenario', scenario.id] });
      toast({
        title: "Scenario updated",
        description: "The scenario has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update scenario. Please try again.",
        variant: "destructive",
      });
      console.error('Update scenario error:', error);
    },
  });
}

export function useDeleteScenario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      queryClient.invalidateQueries({ queryKey: ['baseline-scenario'] });
      queryClient.removeQueries({ queryKey: ['scenario', id] });
      toast({
        title: "Scenario deleted",
        description: "The scenario has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete scenario. Please try again.",
        variant: "destructive",
      });
      console.error('Delete scenario error:', error);
    },
  });
}

export function useEnsureBaselineScenario(programId: string | null) {
  const createScenario = useCreateScenario();
  
  return useMutation({
    mutationFn: async () => {
      if (!programId) return null;

      // Check if baseline scenario already exists
      const { data: existing } = await supabase
        .from('scenarios')
        .select('id')
        .eq('program_id', programId)
        .eq('is_baseline', true)
        .maybeSingle();

      if (existing) return existing;

      // Create baseline scenario
      return createScenario.mutateAsync({
        program_id: programId,
        name: 'Baseline Scenario',
        description: 'Default baseline scenario for ROI calculations',
        discount_rate: 0.08,
        is_baseline: true,
      });
    },
  });
}