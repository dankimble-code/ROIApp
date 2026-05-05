import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, Mail, Save, Settings, Shield, UserCheck, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsAdmin } from '@/hooks/useUserRole';
import { useAdminBenefitDefaults, useUpdateBenefitDefault, BenefitDefault } from '@/hooks/useAdminBenefitDefaults';
import {
  AccessRequest,
  AdminUserSummary,
  useAdminAccessRequests,
  useAdminUsers,
  useGrantAdminRole,
  useReviewAccessRequest,
  useRevokeAdminRole,
} from '@/hooks/useAdminAccess';
import { useRecentActivity } from '@/hooks/useAuditLogs';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';

function formatDateTime(value: string | null) {
  if (!value) return 'Never';

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getStatusVariant(status: AccessRequest['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'approved':
    case 'invited':
      return 'default';
    case 'rejected':
      return 'destructive';
    default:
      return 'secondary';
  }
}

function BenefitDefaultEditor({
  benefit,
  onSave,
}: {
  benefit: BenefitDefault;
  onSave: (id: string, data: Partial<BenefitDefault>) => void;
}) {
  const [description, setDescription] = useState(benefit.description);
  const [value, setValue] = useState(benefit.default_value.toString());
  const [attribution, setAttribution] = useState(benefit.default_attribution.toString());
  const [confidence, setConfidence] = useState(benefit.default_confidence.toString());
  const [isDirty, setIsDirty] = useState(false);

  const handleChange =
    (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
      setIsDirty(true);
    };

  const handleSave = () => {
    onSave(benefit.id, {
      description,
      default_value: parseFloat(value) || 0,
      default_attribution: parseFloat(attribution) || 0,
      default_confidence: parseFloat(confidence) || 0,
    });
    setIsDirty(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`desc-${benefit.id}`}>Description</Label>
        <Textarea id={`desc-${benefit.id}`} value={description} onChange={handleChange(setDescription)} rows={2} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`value-${benefit.id}`}>Default Value ($)</Label>
          <Input id={`value-${benefit.id}`} type="number" min="0" value={value} onChange={handleChange(setValue)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`attr-${benefit.id}`}>Attribution (%)</Label>
          <Input id={`attr-${benefit.id}`} type="number" min="0" max="100" value={attribution} onChange={handleChange(setAttribution)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`conf-${benefit.id}`}>Confidence (%)</Label>
          <Input id={`conf-${benefit.id}`} type="number" min="0" max="100" value={confidence} onChange={handleChange(setConfidence)} />
        </div>
      </div>

      {isDirty && (
        <Button size="sm" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      )}
    </div>
  );
}

function AccessRequestReviewRow({
  request,
  onReview,
  isSaving,
}: {
  request: AccessRequest;
  onReview: (requestId: string, status: AccessRequest['status'], reviewNotes: string) => void;
  isSaving: boolean;
}) {
  const [notes, setNotes] = useState(request.review_notes || '');

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{request.full_name}</p>
            <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{request.email}</p>
          {request.company && <p className="text-sm text-muted-foreground">{request.company}</p>}
          {request.message && <p className="text-sm">{request.message}</p>}
        </div>
        <div className="text-sm text-muted-foreground">
          Requested {formatDateTime(request.requested_at)}
          {request.reviewed_at && <div>Reviewed {formatDateTime(request.reviewed_at)}</div>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`review-notes-${request.id}`}>Review notes</Label>
        <Textarea
          id={`review-notes-${request.id}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes, approval context, or invite status."
          rows={2}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={isSaving} onClick={() => onReview(request.id, 'approved', notes)}>
          Approve
        </Button>
        <Button size="sm" variant="outline" disabled={isSaving} onClick={() => onReview(request.id, 'invited', notes)}>
          Mark Invited
        </Button>
        <Button size="sm" variant="destructive" disabled={isSaving} onClick={() => onReview(request.id, 'rejected', notes)}>
          Reject
        </Button>
      </div>
    </div>
  );
}

function UserRoleRow({
  currentUserId,
  adminUser,
  onGrantAdmin,
  onRevokeAdmin,
  isSaving,
}: {
  currentUserId?: string;
  adminUser: AdminUserSummary;
  onGrantAdmin: (userId: string) => void;
  onRevokeAdmin: (userId: string) => void;
  isSaving: boolean;
}) {
  const isAdmin = adminUser.roles.includes('admin');
  const isSelf = currentUserId === adminUser.id;

  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium">{adminUser.email}</p>
          <p className="text-xs text-muted-foreground">Joined {formatDateTime(adminUser.created_at)}</p>
        </div>
      </TableCell>
      <TableCell>{formatDateTime(adminUser.last_sign_in_at)}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          {adminUser.roles.map((role) => (
            <Badge key={role} variant={role === 'admin' ? 'default' : 'secondary'}>
              {role}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-right">
        {isAdmin ? (
          <Button size="sm" variant="outline" disabled={isSaving || isSelf} onClick={() => onRevokeAdmin(adminUser.id)}>
            Revoke Admin
          </Button>
        ) : (
          <Button size="sm" disabled={isSaving} onClick={() => onGrantAdmin(adminUser.id)}>
            Make Admin
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLoading: isLoadingRole } = useIsAdmin();
  const { data: benefitDefaults = [], isLoading: isLoadingDefaults } = useAdminBenefitDefaults();
  const { data: accessRequests = [], isLoading: isLoadingRequests } = useAdminAccessRequests();
  const { data: adminUsers = [], isLoading: isLoadingUsers } = useAdminUsers();
  const { data: recentActivity = [] } = useRecentActivity(10);
  const updateBenefitDefault = useUpdateBenefitDefault();
  const reviewAccessRequest = useReviewAccessRequest();
  const grantAdminRole = useGrantAdminRole();
  const revokeAdminRole = useRevokeAdminRole();

  const handleSaveBenefitDefault = (id: string, data: Partial<BenefitDefault>) => {
    updateBenefitDefault.mutate({ id, data });
  };

  const handleReviewRequest = (requestId: string, status: AccessRequest['status'], reviewNotes: string) => {
    reviewAccessRequest.mutate({
      id: requestId,
      status,
      reviewNotes,
    });
  };

  if (isLoadingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">Access Denied</h2>
            <p className="mb-4 text-center text-muted-foreground">
              You do not have admin privileges to access this page.
            </p>
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Programs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Admin Settings</h1>
              <Badge variant="default" className="bg-amber-500">
                <Shield className="mr-1 h-3 w-3" />
                Admin
              </Badge>
            </div>
            <p className="text-muted-foreground">Manage access, approvals, roles, and shared system defaults.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" />
              Current Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Logged in as <strong>{user?.email}</strong>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Access Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {accessRequests.filter((request) => request.status === 'pending').length}
            </p>
            <p className="text-sm text-muted-foreground">Pending requests awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              User Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{adminUsers.length}</p>
            <p className="text-sm text-muted-foreground">Known users mirrored from authentication</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Operational Model
          </CardTitle>
          <CardDescription>Recommended admin workflow for controlled access.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>1. Users submit a request for access from the sign-in page.</p>
          <p>2. Admin reviews the request here and marks it approved or rejected.</p>
          <p>3. After approval, send the user an invite from Supabase Auth or your approved onboarding workflow, then mark the request invited.</p>
          <p>4. Admin privileges are granted separately through the role controls below. Jeremy is auto-allowlisted for admin by email.</p>
          <p>5. To fully remove open self-signup, disable email signup in Supabase Auth settings so only invited users can create accounts.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Access Requests
          </CardTitle>
          <CardDescription>Review pending access requests and track where each request is in the onboarding flow.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRequests ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading access requests...</p>
            </div>
          ) : accessRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No access requests have been submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {accessRequests.map((request) => (
                <AccessRequestReviewRow
                  key={request.id}
                  request={request}
                  isSaving={reviewAccessRequest.isPending}
                  onReview={handleReviewRequest}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            User Roles
          </CardTitle>
          <CardDescription>Promote trusted users to admin and keep ordinary users on standard access.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((adminUser) => (
                  <UserRoleRow
                    key={adminUser.id}
                    currentUserId={user?.id}
                    adminUser={adminUser}
                    isSaving={grantAdminRole.isPending || revokeAdminRole.isPending}
                    onGrantAdmin={(userId) => grantAdminRole.mutate({ userId })}
                    onRevokeAdmin={(userId) => revokeAdminRole.mutate({ userId })}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Default Benefit Values
          </CardTitle>
          <CardDescription>
            Configure the default values that appear when users add benefits to their programs. These values are shared across the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDefaults ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading defaults...</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {benefitDefaults.map((benefit) => (
                <AccordionItem key={benefit.id} value={benefit.id}>
                  <AccordionTrigger>
                    <div className="flex w-full items-center justify-between pr-4">
                      <span className="font-medium">{benefit.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(benefit.default_value)} • {benefit.default_attribution}% attr • {benefit.default_confidence}% conf
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <BenefitDefaultEditor benefit={benefit} onSave={handleSaveBenefitDefault} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Admin-Relevant Activity</CardTitle>
          <CardDescription>Recent audit events across organizations, roles, defaults, and access requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent audit activity.</p>
          ) : (
            recentActivity.map((entry) => (
              <div key={entry.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {entry.action} on {entry.entity_type}
                    </p>
                    <p className="text-muted-foreground">{entry.entity_id || 'No entity id'}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDateTime(entry.timestamp)}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
