import React, { useState, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ProfileInfoCard from '@/components/profile/ProfileInfoCard';
import ImageUploadSection from '@/components/profile/ImageUploadSection';
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
      <main className="pb-16">
        <ProfileHeader
          user={user}
          avatar={avatar}
          accountType={accountType}
          isPhotographer={isPhotographer}
          coverUploading={coverUploading}
          uploading={uploading}
          onEditCover={() => coverInputRef.current?.click()}
          onEditProfilePhoto={() => fileInputRef.current?.click()}
          onLogout={logout}
        />

        <div className="container mx-auto px-6 md:px-10">
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />

          <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
            <ProfileSidebar user={user} avatar={avatar} />

            <div className="space-y-8">
              <ProfileInfoCard
                title="Basic Info"
                description="Your primary account details and identity information."
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Name</p>
                    <p className="mt-2 text-base font-medium text-white">{user.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Email</p>
                    <p className="mt-2 text-base font-medium text-white">{user.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Account Type</p>
                    <p className="mt-2 text-base font-medium text-white">{accountType}</p>
                  </div>
                </div>
              </ProfileInfoCard>

              <ImageUploadSection
                isPhotographer={isPhotographer}
                user={user}
                avatar={avatar}
                uploadsEnabled={uploadsEnabled}
                uploading={uploading}
                coverUploading={coverUploading}
                uploadError={uploadError}
                coverError={coverError}
                coverUrlInput={coverUrlInput}
                onCoverUrlInputChange={(e) => setCoverUrlInput(e.target.value)}
                onEditCover={() => coverInputRef.current?.click()}
                onSaveCoverUrl={() => handleSetCoverByUrl()}
                onEditProfilePhoto={() => fileInputRef.current?.click()}
              />

              {isPhotographer ? (
                <ProfileInfoCard
                  title="Bio"
                  description="Introduce your style, specialties, and experience for future portfolio discovery."
                >
                  <div className="flex items-center justify-between">
                    <label htmlFor="bio" className="text-sm font-medium text-zinc-300">Photographer Bio</label>
                    <span className={`text-xs ${bioCharacters > 500 ? 'text-red-400' : 'text-zinc-500'}`}>
                      {bioCharacters}/500
                    </span>
                  </div>
                  <textarea
                    id="bio"
                    value={bio}
                    maxLength={500}
                    rows={6}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-[1.5rem] border border-zinc-700 bg-zinc-800/80 px-4 py-4 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                    placeholder="Tell clients about your photography style, experience, and specialties..."
                  />
                  {bioError ? <p className="text-sm text-red-400">{bioError}</p> : null}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-2xl border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                      disabled={bioSaving || bioCharacters > 500}
                      onClick={handleBioSave}
                    >
                      {bioSaving ? 'Saving...' : 'Save Bio'}
                    </Button>
                  </div>
                </ProfileInfoCard>
              ) : null}

              <ProfileInfoCard
                title="Portfolio Preview"
                description="Reserved space for recent uploads, featured work, and quick portfolio actions."
              >
                <div className="rounded-[1.5rem] border border-dashed border-zinc-700 bg-zinc-950/40 p-6 text-sm text-zinc-400">
                  Portfolio preview widgets will appear here as you add more profile features.
                </div>
              </ProfileInfoCard>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
