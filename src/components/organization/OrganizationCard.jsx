import { Building2, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';

export default function OrganizationCard({ organization }) {
  return (
    <Link to={`/organizations/${organization.id}`} className="block">
      <Card className="h-full border-zinc-800 bg-zinc-900/80 transition hover:border-indigo-500/50">
        <CardContent className="space-y-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{organization.name}</h3>
            <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
              <MapPin className="h-4 w-4" />
              {organization.location || 'Location unavailable'}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
              <Users className="h-4 w-4" />
              {organization.photographer_count || 0} photographer{organization.photographer_count === 1 ? '' : 's'}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
