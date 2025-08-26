import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AuditLog } from '@/types/coaching';

// Fetch audit logs with optional filtering
export function useAuditLogs(filters?: {
  entityType?: string;
  entityId?: string;
  action?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['audit_logs', filters],
    queryFn: async (): Promise<AuditLog[]> => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters?.entityId) {
        query = query.eq('entity_id', filters.entityId);
      }

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
  });
}

// Fetch audit logs for a specific entity
export function useEntityAuditLogs(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['audit_logs', entityType, entityId],
    queryFn: async (): Promise<AuditLog[]> => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching entity audit logs:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!(entityType && entityId),
  });
}

// Fetch recent activity across all entities
export function useRecentActivity(limit: number = 50) {
  return useQuery({
    queryKey: ['audit_logs', 'recent', limit],
    queryFn: async (): Promise<AuditLog[]> => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent activity:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
  });
}