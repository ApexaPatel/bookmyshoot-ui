import React, { useState, useRef } from 'react';
import { User, Camera, ImagePlus, Link2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadProfileImage, uploadCoverImage } from '@/lib/uploadProfileImage';

/** Default avatar when no profile image – show icon in UI */
const DEFAULT_AVATAR_PLACEHOLDER = null;

/**
 * User profile page – PROTECTED. Redirects to /login if not authenticated.
 */
const Profile = () => {
  const { user, logout, updateProfileImage, updateCoverImage, updateBio } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [bioSaving, setBioSaving] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [coverError, setCoverError] = useState('');
  const [bioError, setBioError] = useState('');
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const [bio, setBio] = useState(user?.bio || '');
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const uploadsEnabled = true;
  const isPhotographer = user?.role === 'photographer';

  if (!user) return null;

  const avatar = user.avatar || DEFAULT_AVATAR_PLACEHOLDER;
  const accountType = user.role === 'photographer' ? 'Photographer' : user.role === 'customer' ? 'Customer' : user.role;
  const bioCharacters = bio.length;

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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

  const handleCoverChange = async (e) => {
    const file = e?.target?.files?.[0];
    if (e?.target) e.target.value = '';
    if (!file) return;
    setCoverError('');
    setCoverUploading(true);
    const userId = user?.id ?? user?._id;
    if (!userId) {
      setCoverError('Session error. Please log in again.');
      setCoverUploading(false);
      return;
    }
    try {
      const url = await uploadCoverImage(file, userId);
      await updateCoverImage(url);
    } catch (err) {
      setCoverError(err?.message || 'Upload or save failed');
    } finally {
      setCoverUploading(false);
    }
  };

  const handleSetCoverByUrl = async (urlToSave) => {
    const url = typeof urlToSave === 'string' ? urlToSave.trim() : coverUrlInput.trim();
    if (!url) return;
    setCoverError('');
    setCoverUploading(true);
    try {
      await updateCoverImage(url);
      setCoverUrlInput('');
    } catch (err) {
      const msg = err?.message || (typeof err?.detail === 'string' ? err.detail : 'Failed to save cover');
      setCoverError(msg);
    } finally {
      setCoverUploading(false);
    }
  };

  const handleBioSave = async () => {
    const trimmedBio = bio.trim();
    if (!trimmedBio) {
      setBioError('Bio cannot be empty.');
      return;
    }
    setBioError('');
    setBioSaving(true);
    try {
      await updateBio(trimmedBio);
      setBio(trimmedBio);
    } catch (err) {
      setBioError(err?.message || 'Failed to save bio');
    } finally {
      setBioSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="container mx-auto px-6 md:px-10 py-12 flex justify-center">
        <Card className="w-full max-w-lg bg-zinc-900/80 backdrop-blur border border-white/10 overflow-hidden">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Profile</CardTitle>
            <CardDescription className="text-zinc-400">Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cover image (photographers only) */}
            {isPhotographer && (
              <div className="space-y-2 -mx-6 -mt-2">
                <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center overflow-hidden">
                  {user.cover ? (
                    <img src={user.cover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus className="h-10 w-10 text-zinc-500" aria-hidden />
                  )}
                  {uploadsEnabled && (
                    <>
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverChange}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-2 right-2 opacity-90"
                        disabled={coverUploading}
                        onClick={() => coverInputRef.current?.click()}
                      >
                        {coverUploading ? 'Uploading...' : 'Upload Cover Image'}
                      </Button>
                    </>
                  )}
                </div>
                {coverError && <p className="text-sm text-red-400">{coverError}</p>}
                {/* Fallback: set cover by URL (calls API directly so it reflects on Photographers page) */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-zinc-500 flex items-center gap-1">
                    <Link2 className="h-3 w-3" />
                    Or set cover by image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={coverUrlInput}
                      onChange={(e) => setCoverUrlInput(e.target.value)}
                      className="flex-1 rounded-md border border-zinc-600 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 border-zinc-600 text-zinc-300"
                      disabled={coverUploading || !coverUrlInput.trim()}
                      onClick={() => handleSetCoverByUrl()}
                    >
                      {coverUploading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full h-24 w-24 flex items-center justify-center bg-zinc-700 border border-zinc-600 overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-zinc-400" />
                )}
              </div>
              {uploadsEnabled && (
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
            {isPhotographer ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="bio" className="text-sm text-zinc-500">Bio</label>
                  <span className={`text-xs ${bioCharacters > 500 ? 'text-red-400' : 'text-zinc-500'}`}>
                    {bioCharacters}/500
                  </span>
                </div>
                <textarea
                  id="bio"
                  value={bio}
                  maxLength={500}
                  rows={5}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                  placeholder="Tell clients about your photography style, experience, and specialties..."
                />
                {bioError ? <p className="text-sm text-red-400">{bioError}</p> : null}
                <Button
                  type="button"
                  variant="outline"
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                  disabled={bioSaving || bioCharacters > 500}
                  onClick={handleBioSave}
                >
                  {bioSaving ? 'Saving...' : 'Save Bio'}
                </Button>
              </div>
            ) : null}
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
