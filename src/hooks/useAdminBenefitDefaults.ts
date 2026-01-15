import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BenefitDefault {
  id: string;
  category: string;
  description: string;
  default_value: number;
  default_attribution: number;
  default_confidence: number;
  created_at: string;
  updated_at: string;
}

export function useAdminBenefitDefaults() {
  return useQuery({
    queryKey: ['benefit-defaults'],
    queryFn: async (): Promise<BenefitDefault[]> => {
      const { data, error } = await supabase
        .from('benefit_defaults')
        .select('*')
        .order('category');

      if (error) {
        console.error('Error fetching benefit defaults:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
  });
}

export function useUpdateBenefitDefault() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: Partial<Pick<BenefitDefault, 'description' | 'default_value' | 'default_attribution' | 'default_confidence'>> 
    }) => {
      const { data: result, error } = await supabase
        .from('benefit_defaults')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating benefit default:', error);
        throw new Error(error.message);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefit-defaults'] });
      toast({
        title: 'Default Updated',
        description: 'Benefit default values have been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
