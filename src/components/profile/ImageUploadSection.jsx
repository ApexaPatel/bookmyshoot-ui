import { Camera, ImagePlus, Link2, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ProfileInfoCard from '@/components/profile/ProfileInfoCard';

export default function ImageUploadSection({
  isPhotographer,
  user,
  avatar,
  uploadsEnabled,
  uploading,
  coverUploading,
  uploadError,
  coverError,
  coverUrlInput,
  onCoverUrlInputChange,
  onEditCover,
  onSaveCoverUrl,
  onEditProfilePhoto,
}) {
  return (
    <ProfileInfoCard
      title="Media"
      description="Manage your public profile and cover imagery."
    >
      {isPhotographer ? (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[1.5rem] border border-zinc-800">
            <div className="relative h-52 overflow-hidden bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950">
              {user.cover ? <img src={user.cover} alt="" className="h-full w-full object-cover" /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute right-4 top-4 rounded-full bg-zinc-900/85 text-white hover:bg-zinc-800"
                disabled={!uploadsEnabled || coverUploading}
                onClick={onEditCover}
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                {coverUploading ? 'Uploading...' : 'Edit Cover'}
              </Button>
            </div>
          </div>
          {coverError ? <p className="text-sm text-red-400">{coverError}</p> : null}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-xs text-zinc-500">
              <Link2 className="h-3 w-3" />
              Set cover by URL
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="url"
                placeholder="https://..."
                value={coverUrlInput}
                onChange={onCoverUrlInputChange}
                className="flex-1 rounded-2xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                disabled={coverUploading || !coverUrlInput.trim()}
                onClick={onSaveCoverUrl}
              >
                {coverUploading ? 'Saving...' : 'Save URL'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-zinc-800 bg-zinc-950/40 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
            {avatar ? (
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-8 w-8 text-zinc-500" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white">Profile photo</p>
            <p className="text-sm text-zinc-400">Used across your profile, menus, and public views.</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl border-zinc-700 text-zinc-200 hover:bg-zinc-800"
          disabled={!uploadsEnabled || uploading}
          onClick={onEditProfilePhoto}
        >
          <Camera className="mr-2 h-4 w-4" />
          {uploading ? 'Uploading...' : 'Change Photo'}
        </Button>
      </div>
      {uploadError ? <p className="text-sm text-red-400">{uploadError}</p> : null}
    </ProfileInfoCard>
  );
}
