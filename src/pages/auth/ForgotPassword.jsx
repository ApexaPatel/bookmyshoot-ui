import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Failed to submit request');
      setMessage(data.message || 'If an account exists, a reset link has been sent');
    } catch (err) {
      setError(err.message || 'Something went wrong');
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
              <CardTitle className="text-center text-2xl font-bold text-white">Forgot Password</CardTitle>
              <CardDescription className="text-center text-zinc-400">
                Enter your email and we will send a reset link valid for 15 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {message ? <div className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</div> : null}
              {error ? <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">{error}</div> : null}
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500"
                  />
                </div>
                <Button type="submit" className="h-12 w-full bg-indigo-600 text-white hover:bg-indigo-700" disabled={loading}>
                  {loading ? 'Sending link...' : 'Send reset link'}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="w-full text-center text-sm text-zinc-400">
                Remembered your password?{' '}
                <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">Back to login</Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
