import { Camera, ImagePlus, Mail, User } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function ProfileHeader({
  user,
  avatar,
  accountType,
  isPhotographer,
  coverUploading,
  uploading,
  onEditCover,
  onEditProfilePhoto,
  onLogout,
}) {
  return (
    <section className="relative mb-10">
      <div className="relative h-[220px] overflow-hidden rounded-b-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 shadow-2xl md:h-[250px]">
        {user.cover ? <img src={user.cover} alt="" className="h-full w-full object-cover" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-zinc-950/10" />
        {isPhotographer ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute right-5 top-5 rounded-full bg-zinc-900/80 text-white backdrop-blur hover:bg-zinc-800"
            disabled={coverUploading}
            onClick={onEditCover}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            {coverUploading ? 'Uploading...' : 'Edit Cover'}
          </Button>
        ) : null}
      </div>

      <div className="relative mx-auto -mt-16 w-full max-w-5xl px-4 md:-mt-20 md:px-6">
        <div className="rounded-[2rem] border border-white/10 bg-zinc-900/90 p-5 shadow-2xl backdrop-blur md:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-zinc-950 bg-zinc-800 shadow-xl">
                {avatar ? (
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-10 w-10 text-zinc-500" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={onEditProfilePhoto}
                  className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-zinc-950/85 py-2 text-xs font-medium text-white transition hover:bg-zinc-900"
                  disabled={uploading}
                >
                  <Camera className="mr-1 h-3.5 w-3.5" />
                  {uploading ? 'Uploading...' : 'Edit'}
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-white">{user.name || 'Profile'}</h1>
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-indigo-300">
                    {accountType}
                  </span>
                </div>
                <p className="flex items-center gap-2 text-sm text-zinc-400">
                  <Mail className="h-4 w-4" />
                  {user.email || '—'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                onClick={onEditProfilePhoto}
              >
                Edit Profile
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
