import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { session, loading, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setValidationMessage('Passwords do not match.');
    } else if (password && password.length < 8) {
      setValidationMessage('Use at least 8 characters for the new password.');
    } else {
      setValidationMessage('');
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (validationMessage) {
      return;
    }

    setIsSubmitting(true);
    const { error } = await updatePassword(password);
    setIsSubmitting(false);

    if (!error) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>
              Create a new password for your Coaching ROI account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading your secure reset session...</div>
            ) : !session ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This password reset link is invalid or has expired. Request a new reset email from the sign-in page.
                </p>
                <Button className="w-full" variant="outline" onClick={() => navigate('/auth')}>
                  Back to sign in
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-password">New password</Label>
                  <Input
                    id="reset-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a new password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-password-confirm">Confirm new password</Label>
                  <Input
                    id="reset-password-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat your new password"
                    required
                  />
                </div>
                {validationMessage && (
                  <p className="text-sm text-destructive">{validationMessage}</p>
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting || !!validationMessage}>
                  {isSubmitting ? 'Updating password...' : 'Update password'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
