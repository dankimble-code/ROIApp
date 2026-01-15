import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Program, Organization } from '@/types/coaching';
import { useToast } from '@/hooks/use-toast';

export type ProgramWithOrganization = Program & {
  organization: Organization;
};

export type CreateProgramData = Omit<Program, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProgramData = Partial<Omit<Program, 'id' | 'created_at' | 'updated_at'>>;

// Fetch all programs with organization data
export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: async (): Promise<ProgramWithOrganization[]> => {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          organizations!inner(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching programs:', error);
        throw new Error(error.message);
      }

      // Transform the data to match our expected structure
      const programs = data?.map((item: any) => ({
        ...item,
        organization: item.organizations
      })) || [];

      return programs as ProgramWithOrganization[];
    },
  });
}

// Fetch a single program by ID
export function useProgram(id: string) {
  return useQuery({
    queryKey: ['programs', id],
    queryFn: async (): Promise<ProgramWithOrganization> => {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          organizations!inner(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching program:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Program not found');
      }

      // Transform the data to match our expected structure
      const program = {
        ...data,
        organization: data.organizations
      };

      return program as ProgramWithOrganization;
    },
    enabled: !!id,
  });
}

// Create a new program
export function useCreateProgram() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateProgramData): Promise<Program> => {
      // First, create or get organization
      let organizationId = data.organization_id;
      
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      const { data: program, error } = await supabase
        .from('programs')
        .insert({
          organization_id: organizationId,
          name: data.name,
          duration_months: data.duration_months,
          participants_count: data.participants_count,
          cost_per_participant: data.cost_per_participant,
          overhead_costs: data.overhead_costs || 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating program:', error);
        throw new Error(error.message);
      }

      return program;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast({
        title: "Success",
        description: "Program created successfully",
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

// Update an existing program
export function useUpdateProgram() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProgramData }): Promise<Program> => {
      // Get current data for audit log
      const { data: currentData } = await supabase
        .from('programs')
        .select('*')
        .eq('id', id)
        .single();

      const { data: program, error } = await supabase
        .from('programs')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating program:', error);
        throw new Error(error.message);
      }

      return program;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['programs', data.id] });
      toast({
        title: "Success",
        description: "Program updated successfully",
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

// Delete a program
export function useDeleteProgram() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Get current data for audit log
      const { data: currentData } = await supabase
        .from('programs')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting program:', error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast({
        title: "Success",
        description: "Program deleted successfully",
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

// Duplicate a program
export function useDuplicateProgram() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string): Promise<Program> => {
      // Fetch the original program
      const { data: originalProgram, error: fetchError } = await supabase
        .from('programs')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Create duplicate with modified name
      const { data: newProgram, error: createError } = await supabase
        .from('programs')
        .insert({
          organization_id: originalProgram.organization_id,
          name: `${originalProgram.name} (Copy)`,
          duration_months: originalProgram.duration_months,
          participants_count: originalProgram.participants_count,
          cost_per_participant: originalProgram.cost_per_participant,
          overhead_costs: originalProgram.overhead_costs,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(createError.message);
      }

      // Copy benefits as well
      const { data: benefits } = await supabase
        .from('benefits')
        .select('*')
        .eq('program_id', id);

      if (benefits && benefits.length > 0) {
        const benefitsCopy = benefits.map(benefit => ({
          program_id: newProgram.id,
          category: benefit.category,
          description: benefit.description,
          annual_value: benefit.annual_value,
          attribution_percentage: benefit.attribution_percentage,
          confidence_level: benefit.confidence_level,
        }));

        await supabase.from('benefits').insert(benefitsCopy);
      }

      return newProgram;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast({
        title: "Success",
        description: "Program duplicated successfully",
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