import React from 'react';
import { User } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * User profile page – PROTECTED. Redirects to /login if not authenticated.
 */
const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const accountType = user.role === 'photographer' ? 'Photographer' : user.role === 'customer' ? 'Customer' : user.role;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="container mx-auto px-6 md:px-10 py-12 flex justify-center">
        <Card className="w-full max-w-lg bg-zinc-900/80 backdrop-blur border border-white/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Profile</CardTitle>
            <CardDescription className="text-zinc-400">Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full h-24 w-24 flex items-center justify-center bg-zinc-700 border border-zinc-600 overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-zinc-400" />
                )}
              </div>
            </div>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-zinc-500">Name</dt>
                <dd className="text-white font-medium">{user.name || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Email</dt>
                <dd className="text-white font-medium">{user.email || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Account type</dt>
                <dd className="text-white font-medium">{accountType}</dd>
              </div>
            </dl>
            <Button
              variant="outline"
              className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              onClick={logout}
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
