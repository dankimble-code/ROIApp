import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Organization } from '@/types/coaching';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type CreateOrganizationData = Omit<Organization, 'id' | 'created_at' | 'updated_at' | 'user_id'>;
export type UpdateOrganizationData = Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;

// Fetch all organizations
export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async (): Promise<Organization[]> => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching organizations:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
  });
}

// Fetch a single organization by ID
export function useOrganization(id: string) {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: async (): Promise<Organization> => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching organization:', error);
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!id,
  });
}

// Create a new organization
export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateOrganizationData): Promise<Organization> => {
      if (!user) {
        throw new Error('User must be authenticated to create an organization');
      }

      const { data: organization, error } = await supabase
        .from('organizations')
        .insert({
          name: data.name,
          industry: data.industry,
          employee_count: data.employee_count,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating organization:', error);
        throw new Error(error.message);
      }

      // Log audit trail
      await supabase.from('audit_logs').insert({
        action: 'CREATE',
        entity_type: 'organization',
        entity_id: organization.id,
        new_values: organization,
      });

      return organization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast({
        title: "Success",
        description: "Organization created successfully",
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

// Update an existing organization
export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrganizationData }): Promise<Organization> => {
      // Get current data for audit log
      const { data: currentData } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

      const { data: organization, error } = await supabase
        .from('organizations')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating organization:', error);
        throw new Error(error.message);
      }

      // Log audit trail
      await supabase.from('audit_logs').insert({
        action: 'UPDATE',
        entity_type: 'organization',
        entity_id: id,
        old_values: currentData,
        new_values: organization,
      });

      return organization;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizations', data.id] });
      toast({
        title: "Success",
        description: "Organization updated successfully",
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

// Delete an organization
export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Get current data for audit log
      const { data: currentData } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting organization:', error);
        throw new Error(error.message);
      }

      // Log audit trail
      await supabase.from('audit_logs').insert({
        action: 'DELETE',
        entity_type: 'organization',
        entity_id: id,
        old_values: currentData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast({
        title: "Success",
        description: "Organization deleted successfully",
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