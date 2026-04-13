import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!token) {
      setError('Invalid or expired link');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Failed to reset password');
      setMessage('Password reset successfully');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.message || 'Invalid or expired link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="container mx-auto px-6 py-12 md:px-10">
        <div className="mx-auto w-full max-w-md">
          <Card className="border border-white/10 bg-zinc-900/80 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-white">Reset Password</CardTitle>
              <CardDescription className="text-center text-zinc-400">
                Set a new password for your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {message ? <div className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</div> : null}
              {error ? <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">{error}</div> : null}
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-zinc-300">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-zinc-300">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500"
                  />
                </div>
                <Button type="submit" className="h-12 w-full bg-indigo-600 text-white hover:bg-indigo-700" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset password'}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="w-full text-center text-sm text-zinc-400">
                <Link to="/forgot-password" className="font-medium text-indigo-400 hover:text-indigo-300">Request new reset link</Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
