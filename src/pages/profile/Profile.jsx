import React, { useState, useRef } from 'react';
import { User, Camera } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadProfileImage, isFirebaseConfigured } from '@/lib/uploadProfileImage';

/** Default avatar when no profile image – show icon in UI */
const DEFAULT_AVATAR_PLACEHOLDER = null;

/**
 * User profile page – PROTECTED. Redirects to /login if not authenticated.
 */
const Profile = () => {
  const { user, logout, updateProfileImage } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const firebaseEnabled = isFirebaseConfigured();

  if (!user) return null;

  const avatar = user.avatar || DEFAULT_AVATAR_PLACEHOLDER;
  const accountType = user.role === 'photographer' ? 'Photographer' : user.role === 'customer' ? 'Customer' : user.role;

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseEnabled) return;
    setUploadError('');
    setUploading(true);
    try {
      const url = await uploadProfileImage(file, user.id);
      await updateProfileImage(url);
    } catch (err) {
      setUploadError(err.message || 'Failed to update photo');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

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
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full h-24 w-24 flex items-center justify-center bg-zinc-700 border border-zinc-600 overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-zinc-400" />
                )}
              </div>
              {firebaseEnabled && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Change photo'}
                  </Button>
                </>
              )}
              {uploadError && (
                <p className="text-sm text-red-400">{uploadError}</p>
              )}
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
