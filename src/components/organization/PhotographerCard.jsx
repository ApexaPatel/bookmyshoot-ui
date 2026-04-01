import { Building2, Camera, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';

export default function PhotographerCard({ photographer, organizationName }) {
  return (
    <Link to={`/photographer/${photographer.id}`} className="block">
      <Card className="overflow-hidden border-zinc-800 bg-zinc-900/80 transition hover:border-indigo-500/50">
        <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-zinc-700 to-zinc-800">
          {photographer.cover_image ? (
            <img src={photographer.cover_image} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Camera className="h-10 w-10 text-zinc-500" />
            </div>
          )}
        </div>
        <CardContent className="flex items-start gap-3 p-5">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-zinc-600 bg-zinc-800">
            {photographer.profile_picture ? (
              <img src={photographer.profile_picture} alt="" className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <User className="h-5 w-5 text-zinc-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-white">{photographer.name}</p>
            <p className="truncate text-sm text-zinc-400">{photographer.email || 'Photographer'}</p>
            {organizationName ? (
              <p className="mt-2 flex items-center gap-1 text-xs text-indigo-300">
                <Building2 className="h-3 w-3" />
                {organizationName}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
