import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AccessRequestStatus = 'pending' | 'approved' | 'rejected' | 'invited';

export interface AccessRequest {
  id: string;
  email: string;
  full_name: string;
  company: string | null;
  message: string | null;
  status: AccessRequestStatus;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: Array<'admin' | 'user'>;
}

export interface ProvisionedLoginResult {
  email: string;
  temporaryPassword: string;
  resetLink: string | null;
  isExistingUser: boolean;
}

interface CreateAccessRequestInput {
  email: string;
  fullName: string;
  company?: string;
  message?: string;
}

interface ReviewAccessRequestInput {
  id: string;
  status: AccessRequestStatus;
  reviewNotes?: string;
}

export function useCreateAccessRequest() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ email, fullName, company, message }: CreateAccessRequestInput) => {
      const normalizedEmail = email.trim().toLowerCase();

      const { error } = await supabase.from('access_requests').insert({
        email: normalizedEmail,
        full_name: fullName.trim(),
        company: company?.trim() || null,
        message: message?.trim() || null,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Request submitted',
        description: 'Your access request has been sent for review.',
      });
    },
    onError: (error: Error) => {
      const duplicateRequest =
        error.message.includes('access_requests_email_key') ||
        error.message.toLowerCase().includes('duplicate key');

      toast({
        title: duplicateRequest ? 'Request already submitted' : 'Unable to submit request',
        description: duplicateRequest
          ? 'That email already has an access request on file. Please contact an administrator for an update.'
          : error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useAdminAccessRequests() {
  return useQuery({
    queryKey: ['admin-access-requests'],
    queryFn: async (): Promise<AccessRequest[]> => {
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as AccessRequest[];
    },
  });
}

export function useReviewAccessRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, reviewNotes }: ReviewAccessRequestInput) => {
      const { error } = await supabase
        .from('access_requests')
        .update({
          status,
          review_notes: reviewNotes?.trim() || null,
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-access-requests'] });
      toast({
        title: 'Access request updated',
        description: `Request marked ${variables.status}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Unable to update request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<AdminUserSummary[]> => {
      const [{ data: profiles, error: profilesError }, { data: roles, error: rolesError }] =
        await Promise.all([
          supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('user_roles')
            .select('user_id, role'),
        ]);

      if (profilesError) {
        throw profilesError;
      }

      if (rolesError) {
        throw rolesError;
      }

      const rolesByUser = new Map<string, Array<'admin' | 'user'>>();
      for (const role of roles || []) {
        const userRoles = rolesByUser.get(role.user_id) || [];
        userRoles.push(role.role);
        rolesByUser.set(role.user_id, userRoles);
      }

      return (profiles || []).map((profile) => ({
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        last_sign_in_at: profile.last_sign_in_at,
        roles: rolesByUser.get(profile.id) || ['user'],
      }));
    },
  });
}

export function useGrantAdminRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin',
        });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Admin granted',
        description: 'The user now has admin access.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Unable to grant admin access',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRevokeAdminRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Admin revoked',
        description: 'The user no longer has admin access.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Unable to revoke admin access',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useProvisionApprovedUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ accessRequestId }: { accessRequestId: string }): Promise<ProvisionedLoginResult> => {
      const { data, error } = await supabase.functions.invoke('provision-approved-user', {
        body: {
          accessRequestId,
        },
      });

      if (error) {
        throw error;
      }

      return data as ProvisionedLoginResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-access-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Temporary password ready',
        description: 'Use the generated credentials to notify the approved user.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Unable to provision login',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
