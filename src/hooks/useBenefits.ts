import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Benefit } from '@/types/coaching';
import { useToast } from '@/hooks/use-toast';

export type CreateBenefitData = Omit<Benefit, 'id' | 'created_at' | 'updated_at'>;
export type UpdateBenefitData = Partial<Omit<Benefit, 'id' | 'created_at' | 'updated_at'>>;

// Fetch all benefits for a specific program
export function useBenefits(programId: string | null) {
  return useQuery({
    queryKey: ['benefits', programId],
    queryFn: async (): Promise<Benefit[]> => {
      if (!programId) return [];

      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .eq('program_id', programId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching benefits:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!programId,
  });
}

// Fetch a single benefit by ID
export function useBenefit(id: string) {
  return useQuery({
    queryKey: ['benefits', 'single', id],
    queryFn: async (): Promise<Benefit> => {
      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching benefit:', error);
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!id,
  });
}

// Create a new benefit
export function useCreateBenefit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateBenefitData): Promise<Benefit> => {
      const { data: benefit, error } = await supabase
        .from('benefits')
        .insert({
          program_id: data.program_id,
          category: data.category,
          description: data.description,
          annual_value: data.annual_value,
          attribution_percentage: data.attribution_percentage,
          confidence_level: data.confidence_level,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating benefit:', error);
        throw new Error(error.message);
      }

      // Log audit trail
      await supabase.from('audit_logs').insert({
        action: 'CREATE',
        entity_type: 'benefit',
        entity_id: benefit.id,
        new_values: benefit,
      });

      return benefit;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['benefits', data.program_id] });
      queryClient.invalidateQueries({ queryKey: ['programs'] }); // Refresh programs to update calculations
      toast({
        title: "Success",
        description: "Benefit created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Update an existing benefit
export function useUpdateBenefit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBenefitData }): Promise<Benefit> => {
      // Get current data for audit log
      const { data: currentBenefit } = await supabase
        .from('benefits')
        .select('*')
        .eq('id', id)
        .single();

      if (!currentBenefit) {
        throw new Error('Benefit not found');
      }

      const { data: benefit, error } = await supabase
        .from('benefits')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating benefit:', error);
        throw new Error(error.message);
      }

      // Log audit trail
      await supabase.from('audit_logs').insert({
        action: 'UPDATE',
        entity_type: 'benefit',
        entity_id: id,
        old_values: currentBenefit,
        new_values: benefit,
      });

      return benefit;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['benefits', data.program_id] });
      queryClient.invalidateQueries({ queryKey: ['benefits', 'single', data.id] });
      queryClient.invalidateQueries({ queryKey: ['programs'] }); // Refresh programs to update calculations
      toast({
        title: "Success",
        description: "Benefit updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Delete a benefit
export function useDeleteBenefit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string): Promise<{ programId: string }> => {
      // Get current data for audit log
      const { data: currentData } = await supabase
        .from('benefits')
        .select('*')
        .eq('id', id)
        .single();

      if (!currentData) {
        throw new Error('Benefit not found');
      }

      const { error } = await supabase
        .from('benefits')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting benefit:', error);
        throw new Error(error.message);
      }

      // Log audit trail
      await supabase.from('audit_logs').insert({
        action: 'DELETE',
        entity_type: 'benefit',
        entity_id: id,
        old_values: currentData,
      });

      return { programId: currentData.program_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['benefits', data.programId] });
      queryClient.invalidateQueries({ queryKey: ['programs'] }); // Refresh programs to update calculations
      toast({
        title: "Success",
        description: "Benefit deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Get total attribution for a program (DEPRECATED - attribution is not cumulative)
export function useBenefitAttribution(programId: string | null) {
  return useQuery({
    queryKey: ['benefits', 'attribution', programId],
    queryFn: async (): Promise<{ total: number; remaining: number }> => {
      // Attribution is now per-benefit, not cumulative
      return { total: 0, remaining: 100 };
    },
    enabled: !!programId,
  });
}

// Bulk create benefits
export function useBulkCreateBenefits() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (benefits: CreateBenefitData[]): Promise<Benefit[]> => {
      if (benefits.length === 0) return [];

      const { data, error } = await supabase
        .from('benefits')
        .insert(benefits)
        .select();

      if (error) {
        console.error('Error creating benefits:', error);
        throw new Error(error.message);
      }

      // Log audit trail for each benefit
      const auditLogs = data.map(benefit => ({
        action: 'CREATE',
        entity_type: 'benefit',
        entity_id: benefit.id,
        new_values: benefit,
      }));

      await supabase.from('audit_logs').insert(auditLogs);

      return data;
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['benefits', data[0].program_id] });
        queryClient.invalidateQueries({ queryKey: ['programs'] });
      }
      toast({
        title: "Success",
        description: `${data.length} benefits created successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}